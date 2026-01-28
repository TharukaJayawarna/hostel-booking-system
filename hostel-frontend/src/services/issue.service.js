import api from '../api/axiosConfig';

// Report a new issue
const reportIssue = (issueData) => {
    return api.post('/issues', issueData);
};

export default {
    reportIssue
};