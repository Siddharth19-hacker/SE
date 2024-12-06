import React, { useState, useEffect } from 'react';
import { getAllApplications } from '../admin/apiAdmin';
import { updateApplicationOffer } from '../user/apiUser';
import { isAuthenticated } from '../auth';
import Layout from '../core/Layout';

const MyApplications = ({ userId }) => {
    const { user: { role, _id: loggedInUserId } } = isAuthenticated();
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [offerModal, setOfferModal] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [offerStatus, setOfferStatus] = useState(null);

    const effectiveUserId = userId || loggedInUserId;

    useEffect(() => {
        fetchApplications();
    }, [filter, effectiveUserId]);

    const fetchApplications = async () => {
        try {
            const statusFilter = filter === 'all' ? [] : [filter];
            const data = await getAllApplications(effectiveUserId, statusFilter);

            if (data.length > 0) {
                setApplications(data);
                setError(''); // Clear error when applications are found
            } else {
                setApplications([]);
                setError(`No ${filter} applications found.`); // Specific error for the current filter
            }
        } catch (err) {
            setApplications([]); // Clear applications on error
            setError("Failed to load applications");
            console.error('Error:', err);
        }
    };

    const handleViewOffer = (app) => {
        setCurrentOffer(app);
        setOfferModal(true);
        setOfferStatus(app.offer);
    };

    const handleOfferDecision = async (decision) => {
        try {
            const updatedOfferStatus = decision === 'accepted' ? 'accepted' : 'declined';
            await updateApplicationOffer(currentOffer._id, updatedOfferStatus);
            setApplications((prev) =>
                prev.map((app) =>
                    app._id === currentOffer._id ? { ...app, offer: updatedOfferStatus } : app
                )
            );
            setOfferStatus(updatedOfferStatus);
            setOfferModal(false);
            setSuccess(`Offer successfully ${updatedOfferStatus}.`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('API Error:', err.response ? err.response.data : err.message);
            setError(`Failed to ${decision} the offer. Please try again.`);
        }
    };

    return (
        <Layout title='My Applications' description='Checkout the status of your applications here'>
            <div className="container mt-4">
                <h3 className="text-center mb-4">Applications</h3>

                <div className="mb-4 text-center">
                    <select
                        className="form-select form-control"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Applications</option>
                        <option value="selected">Selected Applications</option>
                        <option value="rejected">Rejected Applications</option>
                        <option value="pending">Pending Applications</option>
                    </select>
                </div>

                {success && <p className="text-success">{success}</p>}

                <div className="row">
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <div className="col-md-4" key={app._id}>
                                <div className="card mb-4">
                                    <div className="card-header bg-primary text-white">
                                        <h4>Course Name: {app.course?.coursename || "No course assigned"}</h4>
                                    </div>
                                    <div className="card-body">
                                        <p><strong>Applicant Name:</strong> {app.submittedBy?.fname} {app.submittedBy?.lname}</p>
                                        <p><strong>Applicant Email:</strong> {app.submittedBy?.email} </p>
                                        <p><strong>Z-Number:</strong> {app.znumber} </p>
                                        <p><strong>Your Application Status:</strong> {app.status}</p>

                                        {role === 0 && app.status === 'selected' && (
                                            <div className="m-2">
                                                <button
                                                    className="btn btn-success m-3"
                                                    onClick={() => handleViewOffer(app)}
                                                >
                                                    View Offer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted">{error}</p>
                    )}
                </div>

                {offerModal && (
                    <div className="modal" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Offer Details</h5>
                                    <button className="close" onClick={() => setOfferModal(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>Course Applied for TA:</strong> {currentOffer.course?.coursename || "N/A"}</p>
                                    <p><strong>Offer Status:</strong>
                                        {offerStatus === 'accepted' && (
                                            <strong>You have accepted your offer.</strong>
                                        )}
                                        {offerStatus === 'declined' && (
                                            <strong>You have declined your offer.</strong>
                                        )}
                                        {offerStatus === 'pending' && (
                                            <strong>Your offer is still pending. Please make a decision.</strong>
                                        )}
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setOfferModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleOfferDecision('accepted')}
                                        disabled={offerStatus === 'accepted' || offerStatus === 'declined'}
                                    >
                                        Accept Offer
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleOfferDecision('declined')}
                                        disabled={offerStatus === 'accepted' || offerStatus === 'declined'}
                                    >
                                        Decline Offer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyApplications;
