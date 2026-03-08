import { useState } from "react";

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const { src, alt, className, style, ...rest } = props;

  if (didError) {
    return (
      <div className={className} style={style}>
        <img src="data:image/svg+xml;base64,..." alt="error" />
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setDidError(true)}
    />
  );
}
