export function App() {
  return (
    <main>
      <h1>把图片变成拼豆模板</h1>
      <label>
        选择图片
        <input
          aria-label="选择图片"
          type="file"
          accept="image/png,image/jpeg,image/webp"
        />
      </label>
    </main>
  );
}
