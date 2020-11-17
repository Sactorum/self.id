import { Button } from 'grommet'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useIDXAuth, useKnownDIDs, useLogin } from '../client/hooks'
import { idx } from '../client/idx'
import { loadProfile } from '../profile'
import { BRAND_COLOR } from '../theme'
import type { IDXBasicProfile } from '../types'

import EditProfileModal from './EditProfileModal'

export interface Props {
  did: string | null
  setProfile: (profile: IDXBasicProfile) => void
}

type EditableState =
  | { loadingProfile: boolean; modalOpen: false; profile?: IDXBasicProfile }
  | { loadingProfile: boolean; modalOpen: true; profile: IDXBasicProfile }

type State = { canEdit: false } | ({ canEdit: true } & EditableState)

export default function EditProfileButton({ did, setProfile }: Props) {
  const [auth] = useIDXAuth()
  const [knownDIDs] = useKnownDIDs()
  const login = useLogin()

  const ownDIDs = useMemo(() => Object.keys(knownDIDs), [knownDIDs])
  const [state, setState] = useState<State>({ canEdit: false })

  const loadAndOpen = useCallback((id) => {
    loadProfile(idx, id).then(
      (profile) => {
        setState({ canEdit: true, loadingProfile: false, modalOpen: true, profile: profile ?? {} })
      },
      (err) => {
        console.warn('Failed to load profile', err)
        setState({ canEdit: true, loadingProfile: false, modalOpen: false })
      }
    )
  }, [])

  const onClose = useCallback(
    (profile?: IDXBasicProfile) => {
      if (profile != null) {
        setProfile(profile)
      }
      setState((current) => ({ ...current, modalOpen: false, profile }))
    },
    [setProfile]
  )

  const onOpen = useCallback(() => {
    if (auth.state === 'CONFIRMED') {
      setState({ canEdit: true, loadingProfile: true, modalOpen: false })
      loadAndOpen(auth.id)
    } else if (auth.state !== 'LOADING') {
      setState({ canEdit: true, loadingProfile: true, modalOpen: false })
      login().then(
        (id) => {
          if (id != null) {
            loadAndOpen(id)
          }
        },
        () => console.warn('Failed to authenticate DID')
      )
    }
  }, [auth, loadAndOpen, login])

  useEffect(() => {
    if (did != null && ownDIDs.includes(did)) {
      setState({ canEdit: true, loadingProfile: false, modalOpen: false })
    } else {
      setState({ canEdit: false })
    }
  }, [did, ownDIDs])

  const button = state.canEdit ? (
    <Button
      primary
      color="rgba(247, 101, 55, 0.1)"
      label={state.loadingProfile ? 'Loading...' : 'Edit'}
      onClick={onOpen}
      style={{ border: 0, color: BRAND_COLOR }}
    />
  ) : null
  const modal =
    state.canEdit && state.modalOpen ? (
      <EditProfileModal onClose={onClose} profile={state.profile} />
    ) : null

  return (
    <>
      {button}
      {modal}
    </>
  )
}
