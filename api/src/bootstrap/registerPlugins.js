import mongoose from "mongoose";
import { tenantPlugin } from "../../models/plugins/tenantPlugin.js";

// Registered as a GLOBAL plugin so every model is tenant-aware. This module must
// be imported before any model/route module so the plugin is applied at compile time.
mongoose.plugin(tenantPlugin);
