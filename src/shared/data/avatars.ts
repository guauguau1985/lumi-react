export const AVATARS = [
  {
    key: 'girl',
    label: 'Avatar de niña',
    shortLabel: 'Niña',
    src: '/img/avatars/girl.png',
  },
  {
    key: 'boy',
    label: 'Avatar de niño',
    shortLabel: 'Niño',
    src: '/img/avatars/boy.png',
  },
  {
    key: 'student-adventure',
    label: 'Avatar explorador',
    shortLabel: 'Explorador',
    src: '/img/avatars/student-adventure.jpeg',
  },
  {
    key: 'student-creator',
    label: 'Avatar creador',
    shortLabel: 'Creador',
    src: '/img/avatars/student-creator.png',
  },
] as const

export type AvatarKey = (typeof AVATARS)[number]['key']

export function avatarSrc(value: string | null | undefined) {
  return AVATARS.find((avatar) => avatar.key === value)?.src ?? AVATARS[0].src
}
