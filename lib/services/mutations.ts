/**
 * Aksi tulis yang disimulasikan di browser. Saat backend siap, ganti isi
 * fungsi dengan panggilan POST/PATCH tanpa mengubah komponen pemanggil.
 */

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function assignTechnician(
  ticketId: string,
  technicianId: string,
  visitDate: string
): Promise<{ ticketId: string; technicianId: string; visitDate: string }> {
  await wait(600);
  return { ticketId, technicianId, visitDate };
}

export interface RolloutHandle {
  cancel: () => void;
}

/**
 * Mensimulasikan pembaruan firmware OTA. Unit diperbarui bertahap dalam
 * gelombang kecil agar mirip rollout sungguhan yang dibatasi bandwidth.
 */
export function simulateFirmwareRollout(
  deviceIds: string[],
  onProgress: (completedIds: string[]) => void,
  onDone: () => void
): RolloutHandle {
  const waves = [4, 3, 5, deviceIds.length];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let completed = 0;

  waves.forEach((size, index) => {
    timers.push(
      setTimeout(() => {
        completed = Math.min(deviceIds.length, completed + size);
        onProgress(deviceIds.slice(0, completed));
        if (completed >= deviceIds.length) onDone();
      }, 1100 * (index + 1))
    );
  });

  return {
    cancel: () => timers.forEach(clearTimeout),
  };
}
