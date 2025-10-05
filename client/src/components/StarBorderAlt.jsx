export default function StarBorderAlt({ as: As = 'div', className = '', speed = '5s', children, topColor = 'linear-gradient(90deg, rgba(0,212,255,0.6), rgba(0,0,0,0))', bottomColor = 'linear-gradient(90deg, rgba(255,0,132,0.6), rgba(0,0,0,0))' }) {
  return (
    <As className={`star-border-container ${className}`}>
      <div className="border-gradient-top" style={{ background: topColor, animationDuration: speed }} />
      <div className="border-gradient-bottom" style={{ background: bottomColor, animationDuration: speed }} />
      <div className="inner-content">
        {children}
      </div>
    </As>
  );
}