import { useCallback, useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  TextField,
  AdminAction,
  Button,
  TextArea,
  Box,
} from "@shopify/ui-extensions-react/admin";
import { getIssues, updateIssues } from "./utils";

function generateId(allIssues) {
  return !allIssues?.length ? 0 : allIssues[allIssues.length - 1].id + 1;
}

function validateForm({ title, description }) {
  return {
    isValid: Boolean(title) && Boolean(description),
    errors: {
      title: !title,
      description: !description,
    },
  };
}

const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  const { close, data, intents } = useApi(TARGET);
  const issueId = intents?.launchUrl
    ? new URL(intents?.launchUrl)?.searchParams?.get("issueId")
    : null;
  const [loading, setLoading] = useState(issueId ? true : false);
  const [issue, setIssue] = useState({ title: "", description: "" });
  const [allIssues, setAllIssues] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const { title, description, id } = issue;
  const isEditing = id !== undefined;

  useEffect(() => {
    getIssues(data.selected[0].id).then((issues) => {
      setLoading(false);
      setAllIssues(issues || []);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = useCallback(async () => {
    const { isValid, errors } = validateForm(issue);
    setFormErrors(errors);

    if (isValid) {
      const newIssues = [...allIssues];
      if (isEditing) {
        const editingIssueIndex = newIssues.findIndex(
          (listIssue) => listIssue.id == issue.id,
        );
        newIssues[editingIssueIndex] = {
          ...issue,
          title,
          description,
        };
      } else {
        newIssues.push({
          id: generateId(allIssues),
          title,
          description,
          completed: false,
        });
      }
      await updateIssues(data.selected[0].id, newIssues);
      close();
    }
  }, [issue, allIssues, isEditing, data.selected, close, title, description]);

  useEffect(() => {
    if (issueId) {
      const editingIssue = allIssues.find(({ id }) => `${id}` === issueId);
      if (editingIssue) {
        setIssue(editingIssue);
      }
    }
  }, [issueId, allIssues]);

  if (loading) {
    return <></>;
  }

  return (
    <AdminAction
      title={isEditing ? "Edit your issue" : "Create an issue"}
      primaryAction={
        <Button onPress={onSubmit}>{isEditing ? "Save" : "Create"}</Button>
      }
      secondaryAction={<Button onPress={close}>Cancel</Button>}
    >
      <TextField
        value={title}
        error={formErrors?.title ? "Please enter a title" : undefined}
        onChange={(val) => setIssue((prev) => ({ ...prev, title: val }))}
        label="Title"
        maxLength={50}
      />
      <Box paddingBlockStart="large">
        <TextArea
          value={description}
          error={
            formErrors?.description ? "Please enter a description" : undefined
          }
          onChange={(val) =>
            setIssue((prev) => ({ ...prev, description: val }))
          }
          label="Description"
          maxLength={300}
        />
      </Box>
    </AdminAction>
  );
}
