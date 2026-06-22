import { useState } from 'react';
import { uploadRoomImage } from '../api/hostApi';

type RoomImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

// 숙소 이미지 업로드 위젯. 파일을 고르면 S3 로 업로드하고, 업로드된 publicUrl 목록을 상위 폼에 전달한다.
// value[0] 이 대표 이미지이며, "대표로" 버튼으로 순서를 바꿔 지정한다.
export function RoomImageUploader({ value, onChange, disabled }: RoomImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(fileList)) {
        uploadedUrls.push(await uploadRoomImage(file));
      }
      onChange([...value, ...uploadedUrls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  }

  function makeRepresentative(index: number) {
    if (index === 0) {
      return;
    }
    const next = [...value];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  return (
    <div className="room-image-uploader">
      <label className="room-image-upload-control">
        숙소 이미지 업로드
        <input
          type="file"
          aria-label="숙소 이미지 업로드"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled || isUploading}
          onChange={(event) => {
            void handleFiles(event.target.files);
            // 같은 파일을 다시 선택해도 onChange 가 발생하도록 초기화한다.
            event.target.value = '';
          }}
        />
        <span className="muted">JPEG·PNG·WebP, 첫 번째 사진이 대표 이미지로 사용됩니다.</span>
      </label>

      {isUploading ? <p className="muted">업로드 중...</p> : null}
      {error ? <span className="field-error">{error}</span> : null}

      {value.length > 0 ? (
        <ul className="room-image-preview-grid">
          {value.map((url, index) => (
            <li key={url} className="room-image-preview">
              <img src={url} alt={`숙소 이미지 ${index + 1}`} />
              {index === 0 ? <span className="room-image-badge">대표</span> : null}
              <div className="room-image-preview-actions">
                {index !== 0 ? (
                  <button type="button" onClick={() => makeRepresentative(index)} disabled={disabled}>
                    대표로
                  </button>
                ) : null}
                <button type="button" onClick={() => removeAt(index)} disabled={disabled}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
