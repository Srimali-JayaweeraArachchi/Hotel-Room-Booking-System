import { useEffect, useMemo } from 'react';

function SelectedImagePreviews({ files, onRemove }) {
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  if (!previews.length) return null;

  return (
    <div className="selected-image-previews" aria-label="Selected room image previews">
      {previews.map(({ file, url }, index) => (
        <figure key={`${file.name}-${file.size}-${file.lastModified}`}>
          <img alt={`Selected preview ${index + 1}: ${file.name}`} src={url} />
          <figcaption title={file.name}>{file.name}</figcaption>
          <button aria-label={`Remove ${file.name}`} onClick={() => onRemove(index)} type="button">×</button>
        </figure>
      ))}
    </div>
  );
}

export default SelectedImagePreviews;
