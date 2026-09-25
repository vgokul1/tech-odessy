import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          icon: 'bi-hourglass-split',
          label: 'Pending Approval',
          className: 'bg-warning-subtle text-warning-emphasis border border-warning',
        };
      case 'confirmed':
        return {
          icon: 'bi-check-circle-fill',
          label: 'Confirmed',
          className: 'bg-primary-subtle text-primary border border-primary',
        };
      case 'active':
        return {
          icon: 'bi-arrow-repeat',
          label: 'In Use / Active',
          className: 'bg-success-subtle text-success border border-success',
        };
      case 'returned':
        return {
          icon: 'bi-check2-all',
          label: 'Returned & Closed',
          className: 'bg-secondary-subtle text-secondary border border-secondary',
        };
      case 'cancelled':
        return {
          icon: 'bi-x-circle-fill',
          label: 'Cancelled',
          className: 'bg-danger-subtle text-danger border border-danger',
        };
      case 'rejected':
        return {
          icon: 'bi-slash-circle-fill',
          label: 'Declined',
          className: 'bg-danger-subtle text-danger border border-danger',
        };
      default:
        return {
          icon: 'bi-info-circle',
          label: status,
          className: 'bg-light text-dark border',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge rounded-pill px-2.5 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5 ${config.className}`}>
      <i className={`bi ${config.icon}`}></i>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
