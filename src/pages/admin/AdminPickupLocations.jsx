import React from "react";
import PickupLocationsAdmin from "../../components/admin/PickupLocationsAdmin";

const AdminPickupLocations = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <PickupLocationsAdmin />
      </div>
    </div>
  );
};

export default AdminPickupLocations;
