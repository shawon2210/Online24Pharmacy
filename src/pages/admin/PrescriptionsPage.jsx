import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Check, X } from "lucide-react";

// Reusable components
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-background0 hover:text-foreground text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
const Button = ({ children, onClick, className = "", ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-semibold text-background bg-emerald-600 hover:bg-emerald-700 transition disabled:bg-muted-foreground ${className}`}
    {...props}
  >
    {children}
  </button>
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// API Functions
const fetchPrescriptions = ({ queryKey }) => {
  const [_key, { status }] = queryKey;
  return axios
    .get(`${API_URL}/api/admin/prescriptions?status=${status}`)
    .then((res) => res.data);
};
const approvePrescription = (id) => {
  if (!id || typeof id !== 'string') throw new Error('Invalid prescription ID');
  return axios.post(`${API_URL}/api/admin/prescriptions/${encodeURIComponent(id)}/approve`);
};
const rejectPrescription = ({ id, notes }) => {
  if (!id || typeof id !== 'string') throw new Error('Invalid prescription ID');
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const headers = {};
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  return axios.post(`${API_URL}/api/admin/prescriptions/${encodeURIComponent(id)}/reject`, { notes }, { headers });
};

const RejectNoteModal = ({ onSubmit, onCancel, isPending }) => {
  const [notes, setNotes] = useState("");
  return (
    <Modal isOpen={true} onClose={onCancel} title="Reject Prescription">
      <div className="space-y-4">
        <p>Please provide a reason for rejection.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
          className="w-full border rounded-md p-2"
          placeholder="e.g., Image is unclear, prescription is invalid..."
        />
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onCancel}
            className="bg-border text-foreground hover:bg-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(notes)}
            disabled={!notes || isPending}
          >
            {isPending ? "Submitting..." : "Submit Rejection"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const AdminPrescriptionsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter] = useState("PENDING");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminPrescriptions", { status: statusFilter }],
    queryFn: fetchPrescriptions,
  });

  const { mutate: approveMutation, isPending: isApproving } = useMutation({
    mutationFn: approvePrescription,
    onSuccess: () => {
      toast.success("Prescription approved!");
      queryClient.invalidateQueries(["adminPrescriptions"]);
      setSelectedPrescription(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Approval failed."),
  });

  const { mutate: rejectMutation, isPending: isRejectingMutation } =
    useMutation({
      mutationFn: rejectPrescription,
      onSuccess: () => {
        toast.success("Prescription rejected.");
        queryClient.invalidateQueries(["adminPrescriptions"]);
        setSelectedPrescription(null);
        setIsRejecting(false);
      },
      onError: (err) =>
        toast.error(err.response?.data?.error || "Rejection failed."),
    });

  const handleApprove = () => {
    if (selectedPrescription) {
      approveMutation(selectedPrescription.id);
    }
  };

  const handleReject = (notes) => {
    if (selectedPrescription) {
      rejectMutation({ id: selectedPrescription.id, notes });
    }
  };

  const prescriptions = data?.data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Review Prescriptions</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-background shadow-md rounded-lg p-4 h-fit">
          <h2 className="font-bold text-lg mb-2">
            Pending Inbox ({prescriptions.length})
          </h2>
          <ul className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
            {isLoading && <li>Loading...</li>}
            {isError && <li className="text-red-500">Failed to load.</li>}
            {prescriptions.map((p) => (
              <li
                key={p.id}
                onClick={() => setSelectedPrescription(p)}
                className={`p-2 cursor-pointer hover:bg-muted ${
                  selectedPrescription?.id === p.id ? "bg-emerald-50" : ""
                }`}
              >
                <p className="font-semibold">
                  {p.user.firstName} {p.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-background shadow-md rounded-lg p-6">
          {selectedPrescription ? (
            <div>
              <h2 className="font-bold text-xl mb-4">Details</h2>
              <div className="mb-4 p-2 border rounded-md bg-background">
                <img
                  src={selectedPrescription.prescriptionImage}
                  alt="Prescription"
                  className="w-full h-auto rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => setIsRejecting(true)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isApproving || isRejectingMutation}
                >
                  <X className="inline-block mr-2" size={20} /> Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isRejectingMutation}
                >
                  <Check className="inline-block mr-2" size={20} /> Approve
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-background0">
              <p>Select a prescription from the inbox to review it.</p>
            </div>
          )}
        </div>
      </div>
      {isRejecting && (
        <RejectNoteModal
          onCancel={() => setIsRejecting(false)}
          onSubmit={handleReject}
          isPending={isRejectingMutation}
        />
      )}
    </div>
  );
};

export default AdminPrescriptionsPage;
