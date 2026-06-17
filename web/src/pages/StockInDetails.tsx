import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { ArrowBigUp as ArrowBack } from "lucide-react";
import { getResource } from "../api/api";
import type { StockIn } from "../api/types";
import { StockInForm } from "../components/form/StockInManagementForm";



export default function StockInDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stockIn, setStockIn] = useState<StockIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockInDetails = async () => {
      if (!id) {
        setError("Stock In ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const stockInData = await getResource('/stock-ins',id);
        setStockIn(stockInData);
      } catch (err) {
        console.error("Error loading stock in details:", err);
        setError(err instanceof Error ? err.message : "Failed to load stock in details");
      } finally {
        setLoading(false);
      }
    };

    loadStockInDetails();
  }, [id]);

  const handleSuccess = () => {
    navigate("/StockInPage");
  };

  const handleCancel = () => {
    navigate("/StockInPage");
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
          onClick={() => navigate("/StockInPage")}
          sx={{ mt: 2 }}
        >
          Back to Stock In
        </Button>
      </Box>
    );
  }

  // The form renders its own header/back button.
  return (
    <>
      {stockIn && (
        <StockInForm
          stockInData={stockIn}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isEditMode={true}
        />
      )}
    </>
  );
}