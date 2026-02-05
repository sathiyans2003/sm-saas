import { useState } from 'react';
import { addContact } from '../../api/contactsApi';
import './ImportContactsModal'

const AddContactModal = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name:'', email:'', phone:'' });

  if (!show) return null;

  const submit = async () => {
    await addContact({ ...form, phone: '+91' + form.phone });
    onSuccess();
    onClose();
  };

  return (
    <>
      <div className="modal show d-block">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Add Contact</h5>
              <button onClick={onClose}>✖</button>
            </div>

            <div className="modal-body">
              <input placeholder="Name"
                className="form-control mb-2"
                onChange={e=>setForm({...form,name:e.target.value})}
              />
              <input placeholder="Email"
                className="form-control mb-2"
                onChange={e=>setForm({...form,email:e.target.value})}
              />
              <input placeholder="Phone"
                className="form-control"
                onChange={e=>setForm({...form,phone:e.target.value})}
              />
            </div>

            <div className="modal-footer">
              <button onClick={onClose}>Cancel</button>
              <button className="btn btn-success" onClick={submit}>Save</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default AddContactModal;
