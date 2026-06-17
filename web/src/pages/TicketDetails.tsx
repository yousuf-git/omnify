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
import type { Ticket } from "../api/types";
import { TicketForm } from "../components/form/TicketForm";


export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTicketDetails = async () => {
      if (!id) {
        setError("Ticket ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const ticketData = await getResource('/ticket', id);
        setTicket(ticketData);
      } catch (err) {
        console.error("Error loading ticket details:", err);
        setError(err instanceof Error ? err.message : "Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    loadTicketDetails();
  }, [id]);

  const handleSuccess = () => {
    navigate("/TicketPage");
  };

  const handleCancel = () => {
    navigate("/TicketPage");
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
          onClick={() => navigate("/TicketPage")}
          sx={{ mt: 2 }}
        >
          Back to Tickets
        </Button>
      </Box>
    );
  }

  // The form renders its own header/back button.
  return (
    <>
      {ticket && (
        <TicketForm
          ticketData={ticket}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isEditMode={true}
        />
      )}
    </>
  );
}