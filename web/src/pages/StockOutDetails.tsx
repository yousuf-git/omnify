import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { ArrowBigUp as ArrowBack } from "lucide-react";
import { getResource, getResources } from "../api/api";
import type { StockOut } from "../api/types";
import StockOutForm from "../components/form/StockOutForm";


export default function StockOutDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stockOut, setStockOut] = useState<StockOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockOutDetails = async () => {
      if (!id) {
        setError("Stock Out ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const stockOutData = await getResource("/stock-outs",id);
        setStockOut(stockOutData);
      } catch (err) {
        console.error("Error loading stock out details:", err);
        setError(err instanceof Error ? err.message : "Failed to load stock out details");
      } finally {
        setLoading(false);
      }
    };

    loadStockOutDetails();
  }, [id]);

  const handleSuccess = () => {
    navigate("/StockOutPage");
  };

  const handleCancel = () => {
    navigate("/StockOutPage");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/StockOutPage")}
          sx={{ mt: 2 }}
        >
          Back to Stock Out
        </Button>
      </Box>
    );
  }

  // The form renders its own header/back button, so no wrapper header here.
  return (
    <>
      {stockOut && (
        <StockOutForm
          stockOutData={stockOut}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isEditMode={true}
        />
      )}
    </>
  );
}