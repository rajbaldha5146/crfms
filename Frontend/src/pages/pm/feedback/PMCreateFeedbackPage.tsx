import CreateFeedbackPage from "../../../components/feedback/CreateFeedbackPage";

/**
 * PM create feedback — redirects to PM user workspace after submit.
 */
const PMCreateFeedbackPage = () => (
  <CreateFeedbackPage
    onSuccessRedirect={(projectId, revieweeUserId) =>
      `/pm-projects/${projectId}/users/${revieweeUserId}`
    }
  />
);

export default PMCreateFeedbackPage;