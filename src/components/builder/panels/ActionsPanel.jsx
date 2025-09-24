import React, { useState } from 'react';
import { 
  Zap, 
  MousePointer, 
  ExternalLink, 
  Mail, 
  Phone, 
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { useBuilder } from '../../../contexts/BuilderContext';

const Toggle = ({ label, enabled, setEnabled, description }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </div>
);

const SelectInput = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const ActionButton = ({ action, isActive, onClick, onEdit, onDelete }) => (
  <div className={`p-3 border rounded-lg transition-all ${
    isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`p-1 rounded ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {action.icon}
        </div>
        <div>
          <p className="text-sm font-medium">{action.name}</p>
          <p className="text-xs text-gray-500">{action.trigger}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="Edit Action"
        >
          <Edit3 className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete Action"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
);

const ActionsPanel = () => {
  const { selectedElement, updateElement } = useBuilder();
  
  // Actions state
  const [actions, setActions] = useState([
    {
      id: 'action-1',
      name: 'Navigate to URL',
      trigger: 'On Click',
      type: 'navigate',
      url: 'https://example.com',
      target: '_blank',
      icon: <ExternalLink className="h-3 w-3" />
    }
  ]);

  const [showAddAction, setShowAddAction] = useState(false);
  const [editingAction, setEditingAction] = useState(null);

  // Action settings
  const [actionSettings, setActionSettings] = useState({
    enableHover: false,
    enableClick: true,
    enableDoubleClick: false,
    enableKeyboard: false,
    keyboardKey: 'Enter',
    preventDefault: true,
    stopPropagation: true
  });

  // Form state for new/editing actions
  const [actionForm, setActionForm] = useState({
    name: '',
    trigger: 'click',
    type: 'navigate',
    url: '',
    target: '_blank',
    email: '',
    phone: '',
    elementId: '',
    property: '',
    value: '',
    delay: 0
  });

  const triggerOptions = [
    { value: 'click', label: 'On Click' },
    { value: 'hover', label: 'On Hover' },
    { value: 'doubleclick', label: 'On Double Click' },
    { value: 'focus', label: 'On Focus' },
    { value: 'blur', label: 'On Blur' },
    { value: 'keydown', label: 'On Key Press' },
    { value: 'load', label: 'On Load' },
    { value: 'scroll', label: 'On Scroll' }
  ];

  const actionTypes = [
    { value: 'navigate', label: 'Navigate to URL', icon: <ExternalLink className="h-4 w-4" /> },
    { value: 'email', label: 'Send Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'phone', label: 'Make Phone Call', icon: <Phone className="h-4 w-4" /> },
    { value: 'download', label: 'Download File', icon: <Download className="h-4 w-4" /> },
    { value: 'toggle', label: 'Toggle Element', icon: <Eye className="h-4 w-4" /> },
    { value: 'animate', label: 'Animate Element', icon: <Play className="h-4 w-4" /> },
    { value: 'scroll', label: 'Scroll to Element', icon: <MousePointer className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom Code', icon: <Zap className="h-4 w-4" /> }
  ];

  const handleAddAction = () => {
    const newAction = {
      id: `action-${Date.now()}`,
      name: actionForm.name || `${actionTypes.find(t => t.value === actionForm.type)?.label}`,
      trigger: triggerOptions.find(t => t.value === actionForm.trigger)?.label,
      type: actionForm.type,
      ...actionForm,
      icon: actionTypes.find(t => t.value === actionForm.type)?.icon
    };

    setActions(prev => [...prev, newAction]);
    setActionForm({
      name: '',
      trigger: 'click',
      type: 'navigate',
      url: '',
      target: '_blank',
      email: '',
      phone: '',
      elementId: '',
      property: '',
      value: '',
      delay: 0
    });
    setShowAddAction(false);
    
    // Apply action to selected element
    if (selectedElement?.element) {
      const element = selectedElement.element;
      
      if (newAction.trigger === 'click') {
        element.onclick = () => executeAction(newAction);
      } else if (newAction.trigger === 'hover') {
        element.onmouseenter = () => executeAction(newAction);
      }
    }
  };

  const handleEditAction = (action) => {
    setEditingAction(action.id);
    setActionForm({ ...action });
    setShowAddAction(true);
  };

  const handleDeleteAction = (actionId) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  };

  const executeAction = (action) => {
    switch (action.type) {
      case 'navigate':
        window.open(action.url, action.target);
        break;
      case 'email':
        window.location.href = `mailto:${action.email}`;
        break;
      case 'phone':
        window.location.href = `tel:${action.phone}`;
        break;
      case 'download':
        const link = document.createElement('a');
        link.href = action.url;
        link.download = '';
        link.click();
        break;
      case 'toggle':
        if (selectedElement?.element) {
          const element = selectedElement.element;
          element.style.display = element.style.display === 'none' ? '' : 'none';
        }
        break;
    }
  };

  const renderActionForm = () => (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <TextInput
        label="Action Name"
        value={actionForm.name}
        onChange={(value) => setActionForm(prev => ({ ...prev, name: value }))}
        placeholder="Enter action name"
      />
      
      <SelectInput
        label="Trigger"
        value={actionForm.trigger}
        options={triggerOptions}
        onChange={(value) => setActionForm(prev => ({ ...prev, trigger: value }))}
      />
      
      <SelectInput
        label="Action Type"
        value={actionForm.type}
        options={actionTypes}
        onChange={(value) => setActionForm(prev => ({ ...prev, type: value }))}
      />

      {/* Action-specific fields */}
      {actionForm.type === 'navigate' && (
        <>
          <TextInput
            label="URL"
            value={actionForm.url}
            onChange={(value) => setActionForm(prev => ({ ...prev, url: value }))}
            placeholder="https://example.com"
          />
          <SelectInput
            label="Target"
            value={actionForm.target}
            options={[
              { value: '_blank', label: 'New Tab' },
              { value: '_self', label: 'Same Tab' },
              { value: '_parent', label: 'Parent Frame' }
            ]}
            onChange={(value) => setActionForm(prev => ({ ...prev, target: value }))}
          />
        </>
      )}

      {actionForm.type === 'email' && (
        <TextInput
          label="Email Address"
          value={actionForm.email}
          onChange={(value) => setActionForm(prev => ({ ...prev, email: value }))}
          placeholder="user@example.com"
        />
      )}

      {actionForm.type === 'phone' && (
        <TextInput
          label="Phone Number"
          value={actionForm.phone}
          onChange={(value) => setActionForm(prev => ({ ...prev, phone: value }))}
          placeholder="+1234567890"
        />
      )}

      {actionForm.type === 'download' && (
        <TextInput
          label="File URL"
          value={actionForm.url}
          onChange={(value) => setActionForm(prev => ({ ...prev, url: value }))}
          placeholder="https://example.com/file.pdf"
        />
      )}

      <div className="flex space-x-2 pt-2">
        <button
          onClick={handleAddAction}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          {editingAction ? 'Update Action' : 'Add Action'}
        </button>
        <button
          onClick={() => {
            setShowAddAction(false);
            setEditingAction(null);
            setActionForm({
              name: '',
              trigger: 'click',
              type: 'navigate',
              url: '',
              target: '_blank',
              email: '',
              phone: '',
              elementId: '',
              property: '',
              value: '',
              delay: 0
            });
          }}
          className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Event Triggers */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <MousePointer className="h-3 w-3 mr-1" />
          Event Triggers
        </h4>
        
        <div className="space-y-3">
          <Toggle
            label="Enable Click Events"
            enabled={actionSettings.enableClick}
            setEnabled={(value) => setActionSettings(prev => ({ ...prev, enableClick: value }))}
            description="Respond to click interactions"
          />
          <Toggle
            label="Enable Hover Events"
            enabled={actionSettings.enableHover}
            setEnabled={(value) => setActionSettings(prev => ({ ...prev, enableHover: value }))}
            description="Respond to hover interactions"
          />
          <Toggle
            label="Enable Double Click"
            enabled={actionSettings.enableDoubleClick}
            setEnabled={(value) => setActionSettings(prev => ({ ...prev, enableDoubleClick: value }))}
            description="Respond to double-click events"
          />
          <Toggle
            label="Enable Keyboard Events"
            enabled={actionSettings.enableKeyboard}
            setEnabled={(value) => setActionSettings(prev => ({ ...prev, enableKeyboard: value }))}
            description="Respond to keyboard interactions"
          />
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            Actions
          </h4>
          <button
            onClick={() => setShowAddAction(true)}
            className="p-1 text-blue-500 hover:text-blue-600 rounded"
            title="Add Action"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add Action Form */}
        {showAddAction && renderActionForm()}

        {/* Actions List */}
        <div className="space-y-2">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No actions configured</p>
              <p className="text-xs text-gray-400">Click + to add your first action</p>
            </div>
          ) : (
            actions.map((action) => (
              <ActionButton
                key={action.id}
                action={action}
                isActive={editingAction === action.id}
                onClick={() => {}}
                onEdit={() => handleEditAction(action)}
                onDelete={() => handleDeleteAction(action.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Event Options */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <RotateCw className="h-3 w-3 mr-1" />
          Event Options
        </h4>
        
        <div className="space-y-3">
          <Toggle
            label="Prevent Default"
            enabled={actionSettings.preventDefault}
            setEnabled={(value) => setActionSettings(prev => ({ ...prev, preventDefault: value }))}
            description="Prevent browser default behavior"
          />
          <Toggle
            label="Stop Propagation"
            enabled={actionSettings.stopPropagation}
            setEnabled={(value) => setActionSettings(prev => ({ ...prev, stopPropagation: value }))}
            description="Stop event from bubbling up"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Quick Actions
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setActionForm({
                ...actionForm,
                type: 'navigate',
                trigger: 'click',
                name: 'Navigate to URL'
              });
              setShowAddAction(true);
            }}
            className="p-2 text-left border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-blue-500 mb-1" />
            <p className="text-xs font-medium">Link</p>
          </button>
          
          <button
            onClick={() => {
              setActionForm({
                ...actionForm,
                type: 'email',
                trigger: 'click',
                name: 'Send Email'
              });
              setShowAddAction(true);
            }}
            className="p-2 text-left border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <Mail className="h-4 w-4 text-green-500 mb-1" />
            <p className="text-xs font-medium">Email</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionsPanel;
