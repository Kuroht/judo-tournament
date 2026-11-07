/**
 * =====================================================
 * FILE: NewFreeGroupForm.tsx
 * PURPOSE: Names a new free group and moves the athlete
 *          into it.
 * USED BY: WeighMoveOptions.tsx
 * =====================================================
 */
import { useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

type NewFreeGroupFormProps = {
  isBusy: boolean;
  onCreate: (label: string) => void;
};

export function NewFreeGroupForm({ isBusy, onCreate }: NewFreeGroupFormProps) {
  const t = useT();
  const [name, setName] = useState('');
  const trimmedName = name.trim();

  return (
    <>
      <TextField
        label={t('weighIn.newGroupName')}
        value={name}
        onChangeText={setName}
        maxLength={100}
      />
      <Button
        label={t('weighIn.createGroup')}
        variant="secondary"
        onPress={() => onCreate(trimmedName)}
        isDisabled={isBusy || trimmedName === ''}
      />
    </>
  );
}
