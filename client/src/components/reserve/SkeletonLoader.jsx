const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="skeletonContainer">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeletonCard">
          <div className="skeletonLine large"></div>
          <div className="skeletonLine medium"></div>
          <div className="skeletonLine medium"></div>
          <div className="skeletonLine small"></div>
          <div style={{ marginTop: '12px' }}>
            <div className="skeletonLine"></div>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
            <div className="skeletonLine"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
