import Link from 'next/link';

const UserDropdown = ({ sites, onLogout }) => {
  return (
    <div className="user-dropdown position-absolute bg-white" 
         style={{ 
           top: '100%', 
           right: '0', 
           minWidth: '280px', 
           zIndex: 1000,
           borderRadius: '12px',
           border: '1px solid #EBECF0',
           boxShadow: '0 10px 40px rgba(0, 2, 41, 0.12)',
           background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'
         }}>
      
      <div className="px-3 py-2" style={{ 
        borderBottom: '1px solid #F2F3F5',
        background: 'linear-gradient(135deg, #6865FF 0%, #5138EE 100%)',
        borderRadius: '12px 12px 0 0',
        margin: '-1px -1px 0 -1px'
      }}>
        <h6 className="mb-0" style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: 'white',
          fontFamily: 'var(--tp-ff-heading)'
        }}>My Websites ({sites.length})</h6>
      </div>
      
      <div className="py-1">
        {sites.length > 0 ? (
          sites.map((site, index) => (
            <Link key={site.id || index} href="/dashboard/websites" 
                  className="d-flex align-items-center px-3 py-2 text-decoration-none hover-item">
              <div className="cube-pagination me-2" style={{
                width: '24px',
                height: '24px',
                border: '1.5px solid #6865FF',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                color: '#6865FF',
                backgroundColor: 'rgba(104, 101, 255, 0.08)'
              }}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <span style={{ 
                fontSize: '14px',
                fontWeight: '500',
                color: '#000229',
                fontFamily: 'var(--tp-ff-body)'
              }}>{site.name}</span>
            </Link>
          ))
        ) : (
          <Link href="/dashboard/websites" className="d-block px-3 py-3 text-decoration-none text-center">
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#F7F9FB',
              border: '1px dashed #EBECF0'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '500',
                color: '#6865FF',
                fontFamily: 'var(--tp-ff-body)'
              }}>+ Create your first website</div>
            </div>
          </Link>
        )}
      </div>
      
      <div className="p-2 d-flex gap-2" style={{ borderTop: '1px solid #F2F3F5' }}>
        <Link href="/dashboard" 
              className="btn flex-fill text-center text-decoration-none"
              style={{ 
                background: 'linear-gradient(135deg, #6865FF 0%, #5138EE 100%)',
                color: 'white', 
                fontSize: '12px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                fontFamily: 'var(--tp-ff-body)'
              }}>
          Dashboard
        </Link>
        <button onClick={onLogout} 
                className="btn flex-fill"
                style={{ 
                  background: 'linear-gradient(135deg, #FF3C82 0%, #E91E63 100%)',
                  color: 'white', 
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: 'var(--tp-ff-body)'
                }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;