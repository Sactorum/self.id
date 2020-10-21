import { Avatar, Box, Button, Image, Layer, Paragraph, Text, TextArea, TextInput } from 'grommet'
import type { TextInputProps } from 'grommet'
import { useCallback, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'

import { idx } from '../client/idx'
import { IDXBasicProfile } from '../types'

export type FormValue = {
  name?: string
  image?: string
  description?: string
  emoji?: string
  background?: string
  birthDate?: string
  url?: string
  gender?: string
  homeLocation?: string
  residenceCountry?: string
  nationality?: string // Array<string> in IDX
}

function profileToForm({ nationalities, ...profile }: IDXBasicProfile): FormValue {
  return { ...profile, nationality: nationalities?.[0] }
}

function changeProfile(
  profile: IDXBasicProfile,
  { nationality, ...value }: FormValue
): IDXBasicProfile {
  const changed = { ...profile, ...value }

  const nationalities = profile.nationalities ?? []
  if (nationality && !nationalities.includes(nationality)) {
    nationalities.unshift(nationality)
  }
  if (nationalities.length) {
    changed.nationalities = nationalities
  }

  return changed
}

interface AlertProps {
  color?: string
  text: string
}

function Alert({ color, text }: AlertProps) {
  return (
    <Box justify="center" border={{ color, size: 'small' }} round={{ size: 'small' }}>
      <Paragraph alignSelf="center" color={color}>
        {text}
      </Paragraph>
    </Box>
  )
}

interface CommonFieldProps {
  inputWidth?: string
  label: string
}

interface FieldProps extends CommonFieldProps {
  children: ReactNode
  id: string
}

function Field({ children, id, inputWidth, label }: FieldProps) {
  return (
    <Box direction="row" flex={false} margin="small">
      <Box align="end" justify="center" margin="small" width="small">
        {/* @ts-ignore htmlFor from label */}
        <Text as="label" color="neutral-2" htmlFor={id}>
          {label}
        </Text>
      </Box>
      <Box width={inputWidth ?? 'medium'}>{children}</Box>
    </Box>
  )
}

interface TextFieldProps
  extends CommonFieldProps,
    Omit<TextInputProps, 'value'>,
    Omit<JSX.IntrinsicElements['input'], 'onSelect' | 'size' | 'placeholder' | 'ref' | 'value'> {
  disabled?: boolean
  name: keyof FormValue
  setValue: (value: FormValue) => void
  value: FormValue
}

function TextField({ label, name, setValue, value, ...props }: TextFieldProps) {
  const id = `field-${name}`

  return (
    <Field id={id} label={label}>
      <TextInput
        {...props}
        id={id}
        onChange={(event) => {
          setValue({ ...value, [name]: event.target.value })
        }}
        value={value[name] ?? ''}
      />
    </Field>
  )
}

interface ImageFieldProps extends TextFieldProps {
  renderImage(props: { src: string; onClick: () => void }): ReactNode
}

function ImageField({
  disabled,
  label,
  name,
  renderImage,
  setValue,
  value,
  ...props
}: ImageFieldProps) {
  const src = value[name] ?? ''
  const [editing, toggleEditing] = useState(!src && !disabled)
  const id = `field-${name}`

  const onClick = useCallback(() => {
    toggleEditing(!disabled)
  }, [disabled])

  const setFieldValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue({ ...value, [name]: event.target.value })
      toggleEditing(false)
    },
    [name, setValue, value]
  )

  return (
    <Field id={id} label={label}>
      {editing ? (
        <TextInput {...props} id={id} onChange={setFieldValue} value={src} />
      ) : (
        renderImage({ onClick, src })
      )}
    </Field>
  )
}

type SavingState = 'PENDING' | 'LOADING' | 'FAILED' | 'DONE'

interface ModalProps {
  onClose: (profile?: IDXBasicProfile) => void
  profile: IDXBasicProfile
}

export default function EditProfileModal({ onClose, profile }: ModalProps) {
  const [value, setValue] = useState<FormValue>(() => profileToForm(profile))
  const [savingState, setSavingState] = useState<SavingState>('PENDING')

  const isLoading = savingState === 'LOADING'

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (isLoading) {
        return
      }
      setSavingState('LOADING')
      const newProfile = changeProfile(profile, value)
      idx.set('basicProfile', newProfile).then(
        () => {
          setSavingState('DONE')
          onClose(newProfile)
        },
        (err) => {
          console.warn('Failed to save profile', err)
          setSavingState('FAILED')
        }
      )
    },
    [isLoading, onClose, profile, value]
  )

  const alert = isLoading ? (
    <Alert color="brand" text="Saving profile..." />
  ) : savingState === 'FAILED' ? (
    <Alert color="status-error" text="Failed to save profile" />
  ) : savingState === 'DONE' ? (
    <Alert color="status-ok" text="Profile successfully saved!" />
  ) : null

  return (
    <Layer margin="small" onEsc={() => onClose()} onClickOutside={() => onClose()}>
      <Box as="form" margin="medium" onSubmit={onSubmit}>
        {alert}
        <Box overflow="auto">
          <Box flex="grow">
            <ImageField
              disabled={isLoading}
              label="Image"
              name="image"
              placeholder="https://mysite.com/avatar.png"
              renderImage={(props) => <Avatar {...props} />}
              setValue={setValue}
              value={value}
            />
            <ImageField
              disabled={isLoading}
              label="Banner"
              name="background"
              placeholder="https://mysite.com/background.png"
              renderImage={({ onClick, src }) => {
                return (
                  <Box height="small">
                    <Image alt={src} fit="cover" onClick={onClick} src={src} />
                  </Box>
                )
              }}
              setValue={setValue}
              value={value}
            />
            <TextField
              disabled={isLoading}
              label="Name"
              name="name"
              setValue={setValue}
              value={value}
            />
            <Field id="field-bio" label="Bio">
              <TextArea
                disabled={isLoading}
                id="field-bio"
                onChange={(event) => {
                  setValue({ ...value, description: event.target.value })
                }}
                rows={4}
                value={value.description}
              />
            </Field>
            <TextField
              disabled={isLoading}
              size="small"
              label="Emoji"
              maxLength={2}
              name="emoji"
              setValue={setValue}
              value={value}
            />
            <TextField
              disabled={isLoading}
              label="Location"
              name="homeLocation"
              setValue={setValue}
              value={value}
            />
            <TextField
              disabled={isLoading}
              label="Country"
              name="residenceCountry"
              setValue={setValue}
              value={value}
            />
            <TextField
              disabled={isLoading}
              label="URL"
              name="url"
              placeholder="https://mysite.com"
              setValue={setValue}
              value={value}
            />
          </Box>
        </Box>
        <Box direction="row">
          <Box flex margin="small">
            <Button
              disabled={isLoading}
              label="Cancel"
              onClick={() => onClose()}
              style={{ border: 0 }}
            />
          </Box>
          <Box flex margin="small">
            <Button
              disabled={isLoading}
              type="submit"
              primary
              label="Submit"
              style={{ color: 'white' }}
            />
          </Box>
        </Box>
      </Box>
    </Layer>
  )
}
