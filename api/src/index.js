// Must run before any model is imported so the tenant plugin is applied globally.
import "./bootstrap/registerPlugins.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { connectDB } from "./config/db.js";
import { recordRequest } from "./metrics.js";
import dotenv from "dotenv";
import DeliveryStatusRounter from "./../routes/deliveryStatus/index.js";
import InstallationStatuses from "./../routes/installationStatus/index.js";
import ItemRouter from "./../routes/item/index.js";
import ItemGroupRouter from "./../routes/itemGroup/index.js";
import LogisticsProviderCategoryRouter from "./../routes/logisticsProviderCategory/index.js";
import PartyRouter from "./../routes/party/index.js";
import ResellerRouter from "./../routes/reseller/index.js";
import StockInRouter from "./../routes/stockIn/index.js";
import StockOutRouter from "./../routes/stockOut/index.js";
import StockInCategoryRouter from "./../routes/stockInCategory/index.js";
import StockOutCategoryRouter from "./../routes/stockOutCategory/index.js";
import StockItemRouter from "./../routes/stockItem/index.js";
import StoreRouter from "./../routes/store/index.js";
import WarehouseRouter from "./../routes/warehouse/index.js";
import ItemStockRecordRouter from "./../routes/itemStockRecord/index.js";
// Ticket-related imports
import TicketStatusRouter from "./../routes/ticketStatus/index.js";
import ResolutionStatusRouter from "./../routes/resolutionStatus/index.js";
import IssueTypeRouter from "./../routes/issueType/index.js";
import AgencyRouter from "./../routes/agency/index.js";
import SupportPersonRouter from "./../routes/supportPerson/index.js";
import TicketRouter from "./../routes/ticket/index.js";
import AssignedToRouter from "./../routes/assignedTo/index.js";
import City from "./../routes/city/index.js";
import State from "./../routes/state/index.js";
import AuthenticationUser from "./../routes/auth/index.js";
// Image handling imports
import ImageRouter from "./../routes/image/index.js";
import AuthRouter from "./../routes/auth/index.js";
import UserRouter from "./../routes/user/user.js";
import AdminTenantRouter from "./../routes/admin/tenants.js";
import TenantSelfRouter from "./../routes/tenant/index.js";
import SandboxRouter from "./../routes/sandbox/index.js";
import HealthRouter from "./../routes/health/index.js";
import cookieParser from "cookie-parser";
// Import scheduler to start cron jobs
import "../services/scheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : process.env.NODE_ENV === "development"
  ? ["http://localhost:5173"]
  : [];

connectDB();

// Defining CORS options
app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", AuthRouter);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Better IP detection - handle IPv6 to IPv4 mapping and proxy headers
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.ip || 
           'unknown';
           
  // Handle comma-separated IPs from proxies (take the first one)
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  // Convert IPv6 localhost to IPv4
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  
  // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  const method = req.method;
  const route = req.originalUrl || req.url;
  
  // Check if this is an auth-related request
  const isAuthRoute = route.includes('/auth') || 
                     route.includes('/login') || 
                     route.includes('/register') || 
                     route.includes('/signin') || 
                     route.includes('/signup');
  
  let logMessage = `[${timestamp}] ${method} ${route} - IP: ${ip}`;
  
  // Only add detailed params/body for non-auth routes
  if (!isAuthRoute) {
    // Add query parameters if any
    if (Object.keys(req.query || {}).length > 0) {
      logMessage += ` - Query: ${JSON.stringify(req.query)}`;
    }
    
    // Add route parameters if any
    if (Object.keys(req.params || {}).length > 0) {
      logMessage += ` - Params: ${JSON.stringify(req.params)}`;
    }
    
    // Add body if any (and not empty)
    if (req.body && Object.keys(req.body).length > 0) {
      logMessage += ` - Body: ${JSON.stringify(req.body)}`;
    }
  }
  
  console.log(logMessage);

  // Exclude the health dashboard/metrics from traffic counters.
  res.on("finish", () => {
    if (route !== "/" && !route.startsWith("/health")) recordRequest(res.statusCode);
  });
  next();
});

// Health dashboard + metrics API (must be before the wildcard "/" routers)
app.use(HealthRouter);

// Sandbox: fully isolated demo data layer (own DB, own token). Unauthenticated
// except for the sandbox session token enforced inside the router.
app.use("/sandbox", SandboxRouter);

app.use("/api/users", UserRouter);
app.use("/api/admin/tenants", AdminTenantRouter);
app.use("/", TenantSelfRouter);
app.use("/", AuthenticationUser);
app.use("/", DeliveryStatusRounter);
app.use("/", InstallationStatuses);
app.use("/", ItemRouter);
app.use("/", ItemGroupRouter);
app.use("/", LogisticsProviderCategoryRouter);
app.use("/", PartyRouter);
app.use("/", ResellerRouter);
app.use("/", StockInRouter);
app.use("/", StockOutRouter);
app.use("/", StockInCategoryRouter);
app.use("/", StockOutCategoryRouter);
app.use("/", StockItemRouter);
app.use("/", StoreRouter);
app.use("/", WarehouseRouter);
app.use("/", ItemStockRecordRouter);
// Ticket-related routes
app.use("/", TicketStatusRouter);
app.use("/", ResolutionStatusRouter);
app.use("/", IssueTypeRouter);
app.use("/", AgencyRouter);
app.use("/", SupportPersonRouter);
app.use("/", TicketRouter);
app.use("/", AssignedToRouter);
app.use("/", City);
app.use("/", State);
// Image handling routes
app.use("/", ImageRouter);

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
