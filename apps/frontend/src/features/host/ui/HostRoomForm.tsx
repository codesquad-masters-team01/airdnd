import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RoomDetail } from '../../rooms/model/roomTypes';
import { AMENITY_OPTIONS } from '../../rooms/model/amenities';
import {
  HostRoomFormInput,
  HostRoomFormValues,
  hostRoomFormSchema,
} from '../model/hostRoomTypes';

type HostRoomFormProps = {
  initialValue?: RoomDetail;
  isSubmitting?: boolean;
  onSubmit: (input: HostRoomFormInput) => void;
};

export function HostRoomForm({ initialValue, isSubmitting = false, onSubmit }: HostRoomFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<HostRoomFormValues, unknown, HostRoomFormInput>({
    resolver: zodResolver(hostRoomFormSchema),
    defaultValues: {
      name: '',
      region: '',
      address: '',
      description: '',
      pricePerNight: 100000,
      maxGuests: 2,
      imageUrl: '',
      imageUrlsText: '',
      allowsInfants: false,
      allowsPets: false,
      amenities: [],
    },
  });

  useEffect(() => {
    if (initialValue) {
      reset({
        ...initialValue,
        imageUrl: initialValue.imageUrl,
        imageUrlsText: initialValue.imageUrls?.filter(url => url !== initialValue.imageUrl).join(', ') || '',
        amenities: initialValue.amenities ?? [],
      });
    }
  }, [initialValue, reset]);

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <label>
        숙소 이름
        <input {...register('name')} />
        {errors.name ? <span className="field-error">{errors.name.message}</span> : null}
      </label>
      <label>
        지역
        <input {...register('region')} />
        {errors.region ? <span className="field-error">{errors.region.message}</span> : null}
      </label>
      <label className="full-row">
        주소
        <input {...register('address')} />
        {errors.address ? <span className="field-error">{errors.address.message}</span> : null}
      </label>
      <label>
        1박 가격
        <input type="number" min={1} {...register('pricePerNight')} />
        {errors.pricePerNight ? (
          <span className="field-error">{errors.pricePerNight.message}</span>
        ) : null}
      </label>
      <label>
        최대 인원
        <input type="number" min={1} {...register('maxGuests')} />
        {errors.maxGuests ? <span className="field-error">{errors.maxGuests.message}</span> : null}
      </label>
      <label className="full-row">
        대표 이미지 URL
        <input {...register('imageUrl')} />
        {errors.imageUrl ? <span className="field-error">{errors.imageUrl.message}</span> : null}
      </label>
      <label className="full-row">
        추가 이미지 URL 목록 (쉼표로 구분)
        <textarea rows={3} placeholder="https://..., https://..." {...register('imageUrlsText')} />
      </label>
      <fieldset className="amenities-fieldset full-row">
        <legend>편의시설</legend>
        <div className="amenities-check-grid">
          {AMENITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <label key={option.value} className="amenity-check">
                <input type="checkbox" value={option.value} {...register('amenities')} />
                <Icon size={18} strokeWidth={1.8} aria-hidden />
                <span>{option.value}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className="checkbox-row full-row">
        <input type="checkbox" {...register('allowsInfants')} />
        <span>
          <strong>유아 동반 허용</strong>
          <small>유아 동반이 가능한 숙소인지 여부를 선택합니다.</small>
        </span>
      </label>
      <label className="checkbox-row full-row">
        <input type="checkbox" {...register('allowsPets')} />
        <span>
          <strong>반려동물 동반 허용</strong>
          <small>검색 필터에서 반려동물 가능 숙소로 노출됩니다.</small>
        </span>
      </label>
      <label className="full-row">
        설명 (선택)
        <textarea rows={6} {...register('description')} />
        {errors.description ? (
          <span className="field-error">{errors.description.message}</span>
        ) : null}
      </label>
      <button className="primary-button full-row" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '숙소 저장'}
      </button>
    </form>
  );
}
