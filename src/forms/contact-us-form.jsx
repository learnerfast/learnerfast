'use client';
import React, { useState } from "react";
import NiceSelect from "../ui/nice-select";

const ContactUsForm = ({ siteId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, siteId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', inquiry: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setErrors({ submit: data.error || 'Failed to submit form' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectHandler = (e) => {
    setFormData({ ...formData, inquiry: e.value });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="box">
        <div className="row gx-20">
          <div className="col-12">
            <div className="postbox__comment-input mb-30">
              <input 
                type="text" 
                className="inputText" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
              <span className="floating-label">Full Name</span>
              {errors.name && <span className="text-danger text-sm">{errors.name}</span>}
            </div>
          </div>
          <div className="col-12">
            <div className="postbox__comment-input mb-30">
              <input 
                type="email" 
                className="inputText" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required 
              />
              <span className="floating-label">Your Email</span>
              {errors.email && <span className="text-danger text-sm">{errors.email}</span>}
            </div>
          </div>
          <div className="col-12">
            <div className="postbox__comment-input mb-35">
              <input 
                type="tel" 
                className="inputText" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <span className="floating-label">Phone Number</span>
              {errors.phone && <span className="text-danger text-sm">{errors.phone}</span>}
            </div>
          </div>
          <div className="col-12">
            <div className="postbox__select mb-30">
              <NiceSelect
                options={[
                  { value: "General Inquiry", text: "General Inquiry" },
                  { value: "Technical Support", text: "Technical Support" },
                  { value: "Sales", text: "Sales" },
                  { value: "Partnership", text: "Partnership" },
                  { value: "Other", text: "Other" },
                ]}
                defaultCurrent={0}
                onChange={selectHandler}
              />
            </div>
          </div>
          <div className="col-xxl-12">
            <div className="postbox__comment-input mb-30">
              <textarea 
                className="textareaText" 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
              <span className="floating-label-2">Message...</span>
              {errors.message && <span className="text-danger text-sm">{errors.message}</span>}
            </div>
          </div>
          {errors.submit && (
            <div className="col-12">
              <div className="alert alert-danger">{errors.submit}</div>
            </div>
          )}
          {success && (
            <div className="col-12">
              <div className="alert alert-success">Thank you! Your message has been sent successfully.</div>
            </div>
          )}
          <div className="col-xxl-12">
            <div className="postbox__btn-box">
              <button className="submit-btn w-100" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send your Request'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default ContactUsForm;
