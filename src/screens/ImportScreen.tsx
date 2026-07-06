interface ImportScreenProps {
  image: File | null;
  onImageChange: (image: File | null) => void;
  onContinue: () => void;
}

export function ImportScreen({
  image,
  onImageChange,
  onContinue
}: ImportScreenProps) {
  return (
    <main>
      <p>本地处理 · 图片不会用于自由重绘</p>
      <h1>把图片变成拼豆模板</h1>
      <p>上传主体清晰的图片，系统会保持比例并匹配 MARD 色号。</p>
      <label className="upload-control">
        选择图片
        <input
          aria-label="选择图片"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
        />
      </label>
      {image ? <p aria-live="polite">{image.name}</p> : null}
      <button type="button" disabled={!image} onClick={onContinue}>
        继续设置
      </button>
    </main>
  );
}
