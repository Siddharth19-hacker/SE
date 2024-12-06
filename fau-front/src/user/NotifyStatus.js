import React from 'react';
import ApplicationsList from "../admin/ApplicationsList";
import { isAuthenticated } from '../auth';

const NotifyStatus = () => {
    const { user } = isAuthenticated();
    return (
        <div>
            {/* Pass user._id to ApplicationsList */}
            <ApplicationsList userId={user._id} />
        </div>
    );
};

export default NotifyStatus;
