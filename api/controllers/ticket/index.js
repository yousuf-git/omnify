import { StockItem } from "../../models/stockItem.js";
import { Ticket } from "../../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const {
      ticketType,
      ticketStatusId,
      resolutionStatusId,
      supportPersonId,
      issueTypeId,
      stockItemId,
      storeId,
      assignedToId,
      openingDate,
      resolutionDate,
      callId,
      rating,
      callIdDate,
      pictures,
      notes,
      isActive,
    } = req.body;

    // if (callId) {
    //   const existingTicket = await Ticket.findOne({ callId });
    //   if (existingTicket) {
    //     return res.status(409).json({
    //       message: "A ticket with this Call ID already exists",
    //       existingTicketId: existingTicket._id
    //     });
    //   }
    // }

    // Validate required fields
    if (!ticketType || ticketType.trim() === "") {
      return res
        .status(400)
        .json({ message: "Ticket type is required and cannot be empty" });
    }

    if (!ticketStatusId || ticketStatusId.trim() === "") {
      return res
        .status(400)
        .json({ message: "Ticket status ID is required and cannot be empty" });
    }

    if (
      ticketType === "SUPPORT" &&
      (!issueTypeId || issueTypeId.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "Issue type ID is required for support tickets" });
    }

    // For installation tickets, clean up empty issueTypeId
    const cleanIssueTypeId =
      issueTypeId && issueTypeId.trim() !== "" ? issueTypeId : undefined;

    // if (!stockItemId || stockItemId.trim() === "") {
    //   return res
    //     .status(400)
    //     .json({ message: "Stock item ID is required and cannot be empty" });
    // }

    // Validate ticket type
    const validTicketTypes = ["INSTALLATION", "SUPPORT"];
    if (!validTicketTypes.includes(ticketType)) {
      return res.status(400).json({
        message: `Invalid ticket type. Must be one of: ${validTicketTypes.join(
          ", "
        )}`,
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 0 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be a number between 0 and 5" });
      }
    }

    // Clean up empty optional fields
    const cleanResolutionStatusId =
      resolutionStatusId && resolutionStatusId.trim() !== ""
        ? resolutionStatusId
        : undefined;
    const cleanSupportPersonId =
      supportPersonId && supportPersonId.trim() !== ""
        ? supportPersonId
        : undefined;

    // Validate MongoDB ObjectId formats for required references
    const objectIdFields = [
      { field: ticketStatusId, name: "ticket status ID" },
    ];

    if (ticketType === "SUPPORT") {
      objectIdFields.push({ field: issueTypeId, name: "issue ID" });
    }

    for (const { field, name } of objectIdFields) {
      if (!field.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: `Invalid ${name} format` });
      }
    }

    // Validate optional ObjectId fields
    if (
      cleanResolutionStatusId &&
      !cleanResolutionStatusId.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid resolution status ID format" });
    }

    if (
      cleanSupportPersonId &&
      !cleanSupportPersonId.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid support person ID format" });
    }

    // Clean up and validate assignedToId (optional)
    const cleanAssignedToId =
      assignedToId && assignedToId.trim() !== "" ? assignedToId : undefined;
    if (cleanAssignedToId && !cleanAssignedToId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid assigned to ID format" });
    }

    // More flexible date validation
    let cleanOpeningDate = openingDate;
    if (openingDate) {
      const openingDateObj = new Date(openingDate);
      if (isNaN(openingDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid opening date format" });
      }
      cleanOpeningDate = openingDateObj.toISOString();
    }

    let cleanResolutionDate = resolutionDate;
    if (resolutionDate) {
      const resolutionDateObj = new Date(resolutionDate);
      if (isNaN(resolutionDateObj.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid resolution date format" });
      }
      // if (cleanOpeningDate && resolutionDateObj < new Date(cleanOpeningDate)) {
      //   return res
      //     .status(400)
      //     .json({ message: "Resolution date cannot be before opening date" });
      // }
      cleanResolutionDate = resolutionDateObj.toISOString();
    }

    let cleanCallIdDate = callIdDate;
    if (callIdDate) {
      const callIdDateObj = new Date(callIdDate);
      if (isNaN(callIdDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid call ID date format" });
      }
      cleanCallIdDate = callIdDateObj.toISOString();
    }

    // Validate callId if provided
    if (callId && (typeof callId !== "string" || callId.length > 50)) {
      return res.status(400).json({
        message: "Call ID must be a string with maximum 50 characters",
      });
    }

    // Validate pictures array if provided
    if (pictures && !Array.isArray(pictures)) {
      return res.status(400).json({ message: "Pictures must be an array" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    const newTicket = new Ticket({
      ticketType,
      ticketStatusId,
      resolutionStatusId: cleanResolutionStatusId,
      supportPersonId: cleanSupportPersonId,
      issueTypeId: cleanIssueTypeId,
      stockItemId,
      storeId,
      assignedToId: cleanAssignedToId,
      openingDate: cleanOpeningDate,
      resolutionDate: cleanResolutionDate,
      callId,
      rating,
      callIdDate: cleanCallIdDate,
      pictures: pictures || [],
      notes,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newTicket.save();

    // After creating the ticket, update the associated stock item (only if stockItemId is a valid MongoDB ObjectId)
    if (req.body.stockItemId && /^[0-9a-fA-F]{24}$/.test(req.body.stockItemId)) {
      await StockItem.findByIdAndUpdate(
        req.body.stockItemId,
        { hasTicket: true },
        { new: true }
      );
    }

    res.status(201).json(newTicket);
  } catch (error) {
    console.log("Ticket creation error:", error);

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Ticket with this call ID already exists" });
    }

    // Handle reference errors (invalid foreign key references)
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: `Invalid ${error.path} provided` });
    }

    res
      .status(500)
      .json({ message: "Error creating ticket: " + error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const filter = showInactive ? {} : { isActive: true };
    const tickets = await Ticket.find(filter)
      .populate("ticketStatusId")
      .populate("resolutionStatusId")
      .populate("supportPersonId")
      .populate("issueTypeId")
      .populate("storeId")
      .populate("assignedToId");
    
    // Manually handle stockItemId population for valid ObjectIds only
    const populatedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const ticketObj = ticket.toObject();
        if (ticketObj.stockItemId && /^[0-9a-fA-F]{24}$/.test(ticketObj.stockItemId.toString())) {
          const stockItem = await StockItem.findById(ticketObj.stockItemId);
          ticketObj.stockItemId = stockItem || ticketObj.stockItemId;
        }
        return ticketObj;
      })
    );
    
    res.status(200).json(populatedTickets);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching tickets" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    const ticket = await Ticket.findById(id)
      .populate("ticketStatusId")
      .populate("resolutionStatusId")
      .populate("supportPersonId")
      .populate("issueTypeId")
      .populate({
        path: "storeId",
        populate: [
          { path: "cityId" },
          { path: "stateId" }
        ]
      })
      .populate("assignedToId");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Manually populate stockItemId only if it's a valid ObjectId
    const ticketObj = ticket.toObject();
    if (ticketObj.stockItemId && /^[0-9a-fA-F]{24}$/.test(ticketObj.stockItemId.toString())) {
      const stockItem = await StockItem.findById(ticketObj.stockItemId);
      ticketObj.stockItemId = stockItem || ticketObj.stockItemId;
    }

    res.status(200).json(ticketObj);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching ticket" });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ticketType,
      ticketStatusId,
      resolutionStatusId,
      supportPersonId,
      issueTypeId,
      stockItemId,
      storeId,
      assignedToId,
      openingDate,
      resolutionDate,
      callId,
      rating,
      callIdDate,
      pictures,
      notes,
      isActive,
    } = req.body;

    // Validate MongoDB ObjectId format for ticket ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    // Validate required fields
    if (!ticketType || ticketType.trim() === "") {
      return res
        .status(400)
        .json({ message: "Ticket type is required and cannot be empty" });
    }

    if (!ticketStatusId || ticketStatusId.trim() === "") {
      return res
        .status(400)
        .json({ message: "Ticket status ID is required and cannot be empty" });
    }

    // if (!stockItemId || stockItemId.trim() === "") {
    //   return res
    //     .status(400)
    //     .json({ message: "Stock item ID is required and cannot be empty" });
    // }

    if (
      ticketType === "SUPPORT" &&
      (!issueTypeId || issueTypeId.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "Issue type ID is required for support tickets" });
    }

    // Clean up issueTypeId for installation tickets
    const cleanIssueTypeId =
      issueTypeId && issueTypeId.trim() !== "" ? issueTypeId : undefined;
    // Validate ticket type
    const validTicketTypes = ["INSTALLATION", "SUPPORT"];
    if (!validTicketTypes.includes(ticketType)) {
      return res.status(400).json({
        message: `Invalid ticket type. Must be one of: ${validTicketTypes.join(
          ", "
        )}`,
      });
    }
    // Validate rating if provided
    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 0 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be a number between 0 and 5" });
      }
    }
    const objectIdFields = [
      { field: ticketStatusId, name: "ticket status ID", required: true },
    ];

    if (ticketType === "SUPPORT") {
      objectIdFields.push({
        field: issueTypeId,
        name: "issue ID",
        required: true,
      });
    }

    for (const { field, name, required } of objectIdFields) {
      if (!field && !required) continue; // skip optional fields
      if (
        !field ||
        typeof field !== "string" ||
        !field.match(/^[0-9a-fA-F]{24}$/)
      ) {
        return res.status(400).json({ message: `Invalid ${name} format` });
      }
    }

    // Validate optional ObjectId fields
    if (resolutionStatusId && !resolutionStatusId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid resolution status ID format" });
    }

    if (supportPersonId && !supportPersonId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid support person ID format" });
    }

    // Clean up and validate assignedToId (optional)
    const cleanAssignedToId =
      assignedToId && assignedToId.trim() !== "" ? assignedToId : undefined;
    if (cleanAssignedToId && !cleanAssignedToId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid assigned to ID format" });
    }

    // // Validate dates
    // if (openingDate) {
    //   const openingDateObj = new Date(openingDate);
    //   if (isNaN(openingDateObj.getTime())) {
    //     return res.status(400).json({ message: "Invalid opening date format" });
    //   }
    //   if (openingDateObj > new Date()) {
    //     return res.status(400).json({ message: "Opening date cannot be in the future" });
    //   }
    // }

    // موجودہ کوڈ:
    if (resolutionDate && openingDate) {
      const opening = new Date(openingDate);
      const resolution = new Date(resolutionDate);

      // SAME date OR SAME time allowed → only block if resolution < opening
      if (resolution.getTime() < opening.getTime()) {
        return res
          .status(400)
          .json({ message: "Resolution date cannot be before opening date" });
      }
    }

    if (resolutionDate && openingDate) {
      const opening = new Date(openingDate);
      const resolution = new Date(resolutionDate);

      opening.setHours(0, 0, 0, 0);
      resolution.setHours(0, 0, 0, 0);

      if (resolution.getTime() < opening.getTime()) {
        return res
          .status(400)
          .json({ message: "Resolution date cannot be before opening date" });
      }
    }
    if (callIdDate) {
      const callIdDateObj = new Date(callIdDate);
      if (isNaN(callIdDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid call ID date format" });
      }
    }

    // Validate callId if provided
    if (callId && (typeof callId !== "string" || callId.length > 50)) {
      return res.status(400).json({
        message: "Call ID must be a string with maximum 50 characters",
      });
    }

    // Validate pictures array if provided
    if (pictures && !Array.isArray(pictures)) {
      return res.status(400).json({ message: "Pictures must be an array" });
    }

    if (pictures && pictures.length > 10) {
      return res
        .status(400)
        .json({ message: "Maximum 10 pictures allowed per ticket" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        ticketType,
        ticketStatusId,
        resolutionStatusId,
        supportPersonId,
        issueTypeId: cleanIssueTypeId,
        stockItemId,
        storeId,
        assignedToId: cleanAssignedToId,
        openingDate,
        resolutionDate,
        callId,
        rating,
        callIdDate,
        pictures,
        notes,
        isActive,
      },
      { new: true }
    )
      .populate("ticketStatusId")
      .populate("resolutionStatusId")
      .populate("supportPersonId")
      .populate("issueTypeId")
      .populate("storeId")
      .populate("assignedToId");

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Manually populate stockItemId only if it's a valid ObjectId
    const ticketObj = updatedTicket.toObject();
    if (ticketObj.stockItemId && /^[0-9a-fA-F]{24}$/.test(ticketObj.stockItemId.toString())) {
      const stockItem = await StockItem.findById(ticketObj.stockItemId);
      ticketObj.stockItemId = stockItem || ticketObj.stockItemId;
    }

    res.status(200).json(ticketObj);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Ticket with this call ID already exists" });
    }

    // Handle reference errors (invalid foreign key references)
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: `Invalid ${error.path} provided` });
    }

    res
      .status(500)
      .json({ message: error.message + " - Error updating ticket" });
  }
};

export const updateTicketResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionStatusId, resolutionDate } = req.body;

    // Validate MongoDB ObjectId format for ticket ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    // Validate required fields
    if (!resolutionStatusId || resolutionStatusId.trim() === "") {
      return res.status(400).json({
        message: "Resolution status ID is required and cannot be empty",
      });
    }

    // Validate resolutionStatusId format as per MongoDB ObjectId
    if (!resolutionStatusId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid resolution status ID format" });
    }

    // Validate resolution date if provided
    if (resolutionDate) {
      const resolutionDateObj = new Date(resolutionDate);
      if (isNaN(resolutionDateObj.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid resolution date format" });
      }
      if (resolutionDateObj > new Date()) {
        return res
          .status(400)
          .json({ message: "Resolution date cannot be in the future" });
      }
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Validate that resolution date is not before opening date
    if (
      resolutionDate &&
      ticket.openingDate &&
      new Date(resolutionDate) < new Date(ticket.openingDate)
    ) {
      return res
        .status(400)
        .json({ message: "Resolution date cannot be before opening date" });
    }

    await ticket.updateResolution(resolutionStatusId, resolutionDate);

    // Populate and return updated ticket
    const updatedTicket = await Ticket.findById(id)
      .populate("ticketStatusId")
      .populate("resolutionStatusId")
      .populate("supportPersonId")
      .populate("issueTypeId")
      .populate("storeId")
      .populate("assignedToId");

    // Manually populate stockItemId only if it's a valid ObjectId
    const ticketObj = updatedTicket.toObject();
    if (ticketObj.stockItemId && /^[0-9a-fA-F]{24}$/.test(ticketObj.stockItemId.toString())) {
      const stockItem = await StockItem.findById(ticketObj.stockItemId);
      ticketObj.stockItemId = stockItem || ticketObj.stockItemId;
    }

    res.status(200).json(ticketObj);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // Handle reference errors (invalid foreign key references)
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: `Invalid ${error.path} provided` });
    }

    res
      .status(500)
      .json({ message: error.message + " - Error updating ticket resolution" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.softDelete();
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error deleting ticket" });
  }
};

export const getTicketsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const showInactive = req.query.showInactive === "true";

    if (!["INSTALLATION", "SUPPORT"].includes(type)) {
      return res.status(400).json({
        message: "Invalid ticket type. Must be INSTALLATION or SUPPORT",
      });
    }

    const filter = showInactive
      ? { ticketType: type }
      : { ticketType: type, isActive: true };
    const tickets = await Ticket.find(filter)
      .populate("ticketStatusId")
      .populate("resolutionStatusId")
      .populate("supportPersonId")
      .populate("issueTypeId")
      .populate("storeId")
      .populate("assignedToId");

    // Manually handle stockItemId population for valid ObjectIds only
    const populatedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const ticketObj = ticket.toObject();
        if (ticketObj.stockItemId && /^[0-9a-fA-F]{24}$/.test(ticketObj.stockItemId.toString())) {
          const stockItem = await StockItem.findById(ticketObj.stockItemId);
          ticketObj.stockItemId = stockItem || ticketObj.stockItemId;
        }
        return ticketObj;
      })
    );

    res.status(200).json(populatedTickets);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching tickets by type" });
  }
};

export const getTicketPublicInfo = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate alphanumeric 6-char ticketId format
    if (!/^[A-Z0-9]{6}$/i.test(id)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    const ticket = await Ticket.findOne({ ticketId: id })
      .select("ticketStatusId storeId isActive")
      .populate("ticketStatusId", "name description")
      .populate("storeId", "storeName storeAddress storeCity smContactNo");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Public access me sirf active tickets show karna hai
    if (!ticket.isActive) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const publicTicketInfo = {
      ticketStatus: ticket.ticketStatusId,
      store: ticket.storeId,
    };

    res.status(200).json(publicTicketInfo);
  } catch (error) {
    res.status(500).json({
      message: error.message + " - Error fetching public ticket information",
    });
  }
};
