// import { InstallationStatus } from "../../models/installationStatus.js";

// export const getInstallationStatuses = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const installationStatuses = await InstallationStatus.find(filter);
//     res.status(200).json(installationStatuses);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getInstallationStatusById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const installationStatus = await InstallationStatus.findById(id);
//     if (!installationStatus) {
//       return res.status(404).json({ message: "Installation Status not found" });
//     }
//     res.status(200).json(installationStatus);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const createInstallationStatus = async (req, res) => {
//   const installationStatus = new InstallationStatus(req.body);
//   try {
//     const savedInstallationStatus = await installationStatus.save();
//     res.status(201).json(savedInstallationStatus);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const updateInstallationStatus = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedInstallationStatus =
//       await InstallationStatus.findByIdAndUpdate(id, req.body, { new: true });
//     if (!updatedInstallationStatus) {
//       return res.status(404).json({ message: "Installation Status not found" });
//     }
//     res.status(200).json(updatedInstallationStatus);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const deleteInstallationStatus = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedInstallationStatus =
//       await InstallationStatus.findById(id);
//     if (!deletedInstallationStatus) {
//       return res.status(404).json({ message: "Installation Status not found" });
//     }
//     deletedInstallationStatus.isActive = false;
//     await deletedInstallationStatus.save();
//     res
//       .status(200)
//       .json({ message: "Installation Status deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


import { InstallationStatus } from "../../models/installationStatus.js";

export const getInstallationStatuses = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let installationStatuses;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      installationStatuses = await InstallationStatus.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      installationStatuses = showInactive 
        ? await InstallationStatus.find() 
        : await InstallationStatus.find().active();
    }
    
    res.status(200).json(installationStatuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstallationStatusById = async (req, res) => {
  const { id } = req.params;
  try {
    const installationStatus = await InstallationStatus.findById(id);
    if (!installationStatus) {
      return res.status(404).json({ message: "Installation Status not found" });
    }
    res.status(200).json(installationStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInstallationStatus = async (req, res) => {
  const installationStatus = new InstallationStatus(req.body);
  try {
    const savedInstallationStatus = await installationStatus.save();
    res.status(201).json(savedInstallationStatus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInstallationStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedInstallationStatus =
      await InstallationStatus.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedInstallationStatus) {
      return res.status(404).json({ message: "Installation Status not found" });
    }
    res.status(200).json(updatedInstallationStatus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteInstallationStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const installationStatus = await InstallationStatus.findById(id);
    if (!installationStatus) {
      return res.status(404).json({ message: "Installation Status not found" });
    }
    
    installationStatus.isActive = !installationStatus.isActive;
    if (!installationStatus.isActive) {
      installationStatus.deletedAt = new Date();
    } else {
      installationStatus.deletedAt = null;
    }
    
    await installationStatus.save();
    
    res.status(200).json({
      message: `Installation Status ${installationStatus.isActive ? "enabled" : "disabled"} successfully`,
      installationStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteInstallationStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedInstallationStatus = await InstallationStatus.findByIdAndDelete(id);
    if (!deletedInstallationStatus) {
      return res.status(404).json({ message: "Installation Status not found" });
    }
    res.status(200).json({ message: "Installation Status permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restore Soft Deleted Installation Status
export const restoreInstallationStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const installationStatus = await InstallationStatus.findById(id);
    if (!installationStatus) {
      return res.status(404).json({ message: "Installation Status not found" });
    }
    
    installationStatus.isActive = true;
    installationStatus.deletedAt = null;
    await installationStatus.save();
    
    res.status(200).json({
      message: "Installation Status restored successfully",
      installationStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};