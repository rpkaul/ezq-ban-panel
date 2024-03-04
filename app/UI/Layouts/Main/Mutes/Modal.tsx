import type { API_MUTES } from '@/pages/api/mutes'
import type { KeyedMutator } from 'swr'
import { useForm, zodResolver } from '@mantine/form'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/modal'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { Select, SelectItem } from '@nextui-org/select'
import { MUTE_OPTIONS } from '.'
import axios from 'axios'
import GetDateTimeString from '@/utils/functions/GetDateTimeString'
import muteSchema from '@/utils/schemas/muteSchema'

const MuteModal = ({
	open,
	setOpen,
	mutate,
}: {
	open: boolean
	setOpen: (open: boolean) => void
	mutate: KeyedMutator<API_MUTES>
}) => {
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async () => {
		if (isLoading) return

		setIsLoading(true)

		try {
			await axios(`/api/mutes`, {
				method: 'POST',
				data: form.values,
			})

			await mutate()
			toast.success(`Succesfully muted player!`)

			setOpen(false)
		} catch (error) {
			const errorString = (error as any)?.response?.data || (error as any)?.message
			console.error(error)
			toast.error(`Failed to create mute!\n${errorString || error}`)
		}

		setIsLoading(false)
	}

	const form = useForm({
		initialValues: {
			player_steamid: '',
			reason: '',
			duration: '',
			comment: '',
			type: 'MUTE',
		},
		validate: zodResolver(muteSchema),
	})

	return (
		<Modal
			isOpen={open}
			onOpenChange={isLoading ? undefined : setOpen}
		>
			<ModalContent>
				{(onClose) => (
					<form onSubmit={form.onSubmit(handleSubmit)}>
						<ModalHeader className='flex flex-col gap-1'>Create new mute</ModalHeader>
						<ModalBody>
							<Input
								{...form.getInputProps('player_steamid')}
								errorMessage={form.errors.player_steamid}
								label='Player Steam64 / SteamId / Profile URL'
								placeholder='7656XXXXXX'
								variant='bordered'
								isDisabled={isLoading}
								autoFocus
							/>
							<Select
								label='Type'
								placeholder='Select the mute type'
								selectedKeys={[form.values.type]}
								onChange={(newType) => form.setValues({ type: newType.target.value })}
								isDisabled={isLoading}
								disallowEmptySelection
							>
								{MUTE_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.name}
									</SelectItem>
								))}
							</Select>
							<Input
								{...form.getInputProps('reason')}
								errorMessage={form.errors.reason}
								label='Reason (min 3 characters)'
								placeholder='Cheating / Griefing / Toxicity / etc.'
								variant='bordered'
								isDisabled={isLoading}
							/>
							<Input
								{...form.getInputProps('duration')}
								errorMessage={form.errors.duration}
								label='Duration in minutes'
								placeholder='for example, 60'
								description='0 for permanent'
								variant='bordered'
								type='number'
								isDisabled={isLoading}
							/>
							<Input
								{...form.getInputProps('comment')}
								errorMessage={form.errors.comment}
								label='Comment (optional)'
								variant='bordered'
								isDisabled={isLoading}
							/>

							<div className='flex flex-col text-xs'>
								<span>
									The mute will start now <b>({GetDateTimeString()})</b>
								</span>
								<span>
									and will end at{' '}
									<b>
										{form.values.duration === '0' ? (
											<b className='text-red-700'>Permanent</b>
										) : (
											GetDateTimeString(
												new Date().getTime() + Number(form.values.duration) * 60000
											)
										)}
									</b>
								</span>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button
								color='danger'
								variant='flat'
								onPress={onClose}
								isDisabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								color='primary'
								type='submit'
								isLoading={isLoading}
							>
								Mute player
							</Button>
						</ModalFooter>
					</form>
				)}
			</ModalContent>
		</Modal>
	)
}

export default MuteModal
