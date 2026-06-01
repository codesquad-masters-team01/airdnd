import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  HostRoom,
  HostRoomFormInput,
  HostRoomFormValues,
  hostRoomFormSchema,
} from '../model/hostRoomTypes';

type HostRoomFormProps = {
  initialValue?: HostRoom;
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
      amenitiesText: '',
    },
  });

  useEffect(() => {
    if (initialValue) {
      reset({
        ...initialValue,
        amenitiesText: initialValue.amenities.join(', '),
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
        이미지 URL
        <input {...register('imageUrl')} />
        {errors.imageUrl ? <span className="field-error">{errors.imageUrl.message}</span> : null}
      </label>
      <label className="full-row">
        편의시설
        <input placeholder="와이파이, 주차, 주방" {...register('amenitiesText')} />
      </label>
      <label className="full-row">
        설명
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
