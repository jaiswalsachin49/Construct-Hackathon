import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommunitiesPage from './CommunitiesPage';
import CreateCommunityModal from '../../components/communities/CreateCommunityModal';

const CreateCommunityPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    navigate('/app/communities');
  };

  return (
    <>
      <CommunitiesPage />
      <CreateCommunityModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default CreateCommunityPage;
