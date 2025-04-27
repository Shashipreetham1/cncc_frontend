import React from 'react';

const PurchaseOrderListPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-4">Purchase Orders</h1>
       <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-neutral-600">(PO list table, pagination, filters, add button, etc. go here)</p>
       </div>
    </div>
  );
};

export default PurchaseOrderListPage;