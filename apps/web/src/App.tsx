export function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#FD7014', margin: 0 }}>Hathor Platform</h1>
        <p style={{ color: '#a4b0be' }}>
          Regional E-Commerce & Microservice Infrastructure
        </p>
      </header>
      <main>
        <section
          style={{
            backgroundColor: '#393E46',
            padding: '1.5rem',
            borderRadius: '8px',
            maxWidth: '700px',
          }}
        >
          <h2>Monorepo Services & Infrastructure Initialized</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <strong>API Gateway:</strong> Edge Router (Port 5000)
            </li>
            <li>
              <strong>Auth Service:</strong> User Authentication & Access Tokens (Port 5001 - <code>auth_db</code>)
            </li>
            <li>
              <strong>Catalog Service:</strong> Storefront Catalog Registry & Themes (Port 5002 - <code>catalog_db</code>)
            </li>
            <li>
              <strong>Commerce Service:</strong> 3-Stage Payment & Cart Engine (Port 5003 - <code>commerce_db</code>)
            </li>
            <li>
              <strong>Library Service:</strong> Gamer Library & License Management (Port 5004 - <code>library_db</code>)
            </li>
            <li>
              <strong>Infrastructure:</strong> PostgreSQL (5432), Memcached (11211), Redis (6379), RabbitMQ (5672)
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
