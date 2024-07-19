'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import styles from './settingOptions.module.css';
import CustomImage from '@/components/ImageComponents/CustomImage';
import imagePath from '@/app/imagePath';
import CustomDropdown from '@/components/CustomDropdown/CustomDropdown';
import CustomModal from '@/components/CustomModal/CustomModal';
import CustomInput from '@/components/CustomInput/CustomInput';
import {
  addUserToOrganisation,
  getOrganisationMembers,
  removeUserFromOrganisation,
} from '@/api/DashboardService';
import { validateEmail } from '@/app/utils';
import {
  InviteUserPayload,
  RemoveUserPayload,
  UserTeamDetails,
} from '../../../../types/organisationTypes';

export default function Users() {
  const [openInviteUserModal, setOpenInviteUserModal] =
    useState<boolean>(false);
  const [openRemoveUserModal, setOpenRemoveUserModal] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [userList, setUserList] = useState<UserTeamDetails[]>([]);
  const [inviteUserEmail, setInviteUserEmail] = useState<string>('');
  const [removeUserDetails, setRemoveUserDetails] =
    useState<UserTeamDetails | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string>('');

  const handleOpenRemoveModal = (data: UserTeamDetails) => {
    setRemoveUserDetails(data);
    setOpenRemoveUserModal(true);
  };

  const handleSendInvite = () => {
    if (!validateEmail(inviteUserEmail)) {
      setEmailErrorMsg('Enter a Valid Email.');
      return;
    }
    sendInvite().then().catch();
  };

  const onSetEmail = (value) => {
    setInviteUserEmail(value);
    setEmailErrorMsg('');
  };

  useEffect(() => {
    fetchUsersFromOrganisation().then().catch();
  }, []);

  useEffect(() => {
    onSetEmail('');
  }, [openInviteUserModal]);

  async function fetchUsersFromOrganisation() {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await getOrganisationMembers();
      if (response) {
        const data = response.data;
        const users = data.users;
        setUserList([
          ...users.filter((user: UserTeamDetails) => user.email === userEmail),
          ...users.filter((user: UserTeamDetails) => user.email !== userEmail),
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function sendInvite() {
    try {
      setIsLoading(true);
      const data: InviteUserPayload = {
        email: inviteUserEmail,
      };
      const response = await addUserToOrganisation(data);
      if (response) {
        fetchUsersFromOrganisation().catch();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setOpenInviteUserModal(false);
    }
  }

  async function toRemoveUserFromOrganisation() {
    try {
      setIsLoading(true);
      const data: RemoveUserPayload = {
        user_id: removeUserDetails.id,
      };
      const response = await removeUserFromOrganisation(data);
      if (response) {
        fetchUsersFromOrganisation().then().catch();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setOpenRemoveUserModal(false);
      setRemoveUserDetails(null);
    }
  }

  return (
    <div id={'users'} className={'proxima_nova flex flex-col gap-6'}>
      <CustomModal
        isOpen={openInviteUserModal}
        onClose={() => setOpenInviteUserModal(false)}
        width={'30vw'}
      >
        <CustomModal.Header title={'Add User'} />
        <CustomModal.Body padding={'24px 16px'}>
          <div className={'flex flex-col gap-2'}>
            <span className={'secondary_color text-sm font-normal'}>Email</span>
            <CustomInput
              format={'text'}
              value={inviteUserEmail}
              setter={onSetEmail}
              placeholder={'Enter Email Address'}
              isError={emailErrorMsg !== ''}
              errorMessage={emailErrorMsg}
            />
          </div>
        </CustomModal.Body>
        <CustomModal.Footer>
          <Button
            className={'primary_medium'}
            onClick={handleSendInvite}
            isLoading={isLoading}
          >
            Invite User
          </Button>
        </CustomModal.Footer>
      </CustomModal>

      <CustomModal
        isOpen={openRemoveUserModal}
        onClose={() => setOpenRemoveUserModal(false)}
        width={'30vw'}
      >
        <CustomModal.Header title={'Remove User'} />
        <CustomModal.Body padding={'24px 16px'}>
          <span className={'secondary_color text-sm font-normal'}>
            Are you sure you want to remove{' '}
            {removeUserDetails && removeUserDetails.email}?
          </span>
        </CustomModal.Body>
        <CustomModal.Footer>
          <Button
            className={'primary_medium'}
            onClick={toRemoveUserFromOrganisation}
            isLoading={isLoading}
          >
            Remove
          </Button>
        </CustomModal.Footer>
      </CustomModal>
      <div className={'flex flex-row justify-between'}>
        <span className={'text-xl text-white'}>Users</span>
        <Button
          className={'primary_medium w-fit'}
          onClick={() => setOpenInviteUserModal(true)}
        >
          Add Users
        </Button>
      </div>
      <div className={`${styles.user_list_container} rounded-lg`}>
        <div className={`${styles.heading} rounded-t-lg px-3 py-2`}>
          <span className={'secondary_color text-sm'}>Email</span>
        </div>
        {userList &&
          userList.map((item, index) => {
            return (
              <div className={`px-3 py-4 ${styles.item} flex justify-between`}>
                <span className={`text-sm text-white`}>{item.email}</span>
                {index !== 0 && (
                  <CustomDropdown
                    trigger={
                      <CustomImage
                        className={'size-5 cursor-pointer'}
                        src={imagePath.verticalThreeDots}
                        alt={'three_dots_icon'}
                      />
                    }
                    maxHeight={'200px'}
                    gap={'10px'}
                    position={'start'}
                  >
                    <CustomDropdown.Item
                      key={'1'}
                      onClick={() => handleOpenRemoveModal(item)}
                    >
                      <div
                        className={
                          'flex flex-row items-center justify-center gap-2'
                        }
                      >
                        <CustomImage
                          className={'size-4'}
                          src={imagePath.closeCircleIcon}
                          alt={'close_icon'}
                        />
                        Remove
                      </div>
                    </CustomDropdown.Item>
                  </CustomDropdown>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}