import { useState } from "react";
import Header from "../../components/layout/Header";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Mail, User, Shield, Trash2, Plus } from "lucide-react";

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Admin Dashboard"
        subtitle="Manage system components and users"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Section 1: Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 ml-1">Global Buttons</h2>
          <div className="card flex flex-wrap gap-4 items-center">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Open Global Modal
            </Button>
            
            <Button variant="secondary">Secondary Button</Button>
            
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              <Trash2 size={18} />
              Delete Resource
            </Button>
            
            <Button variant="ghost">Ghost Button</Button>
            
            <Button variant="primary" isLoading>Loading...</Button>
          </div>
        </section>

        {/* Section 2: Inputs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 ml-1">Global Inputs</h2>
          <div className="card grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
              icon={<User size={18} />} 
            />
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="john@example.com" 
              icon={<Mail size={18} />} 
            />
            
            <Input 
              label="Username" 
              placeholder="johndoe" 
              error="This username is already taken" 
              icon={<Shield size={18} />}
            />

            <Input 
              label="Disabled Input" 
              disabled 
              placeholder="You cannot edit this" 
            />
          </div>
        </section>

        {/* Section 3: Information Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border-l-4 border-l-slate-900">
            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Total Users</h3>
            <p className="text-3xl font-extrabold mt-2 text-slate-900">1,284</p>
          </div>
          <div className="card p-6 border-l-4 border-l-emerald-500">
            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Active Reviews</h3>
            <p className="text-3xl font-extrabold mt-2 text-slate-900">42</p>
          </div>
          <div className="card p-6 border-l-4 border-l-sky-500">
            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Reports Pending</h3>
            <p className="text-3xl font-extrabold mt-2 text-slate-900">7</p>
          </div>
        </section>
      </main>

      {/* Global Modal Demo */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New User"
      >
        <div className="space-y-6">
          <p className="text-slate-600">
            Fill out the form below to add a new administrator to the system.
          </p>
          <div className="space-y-4">
            <Input label="Name" placeholder="Enter name" />
            <Input label="Email" placeholder="Enter email" type="email" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary">Create Account</Button>
          </div>
        </div>
      </Modal>

      {/* Global Confirm Dialog Demo */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => alert("Resource Deleted!")}
        title="Confirm Deletion"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default AdminDashboard;
