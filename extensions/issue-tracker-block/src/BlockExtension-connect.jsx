import { useEffect, useMemo, useState } from "react";
import {
  AdminBlock,
  Box,
  Button,
  Divider,
  Form,
  Icon,
  InlineStack,
  ProgressIndicator,
  Select,
  Text,
  reactExtension,
  useApi,
} from "@shopify/ui-extensions-react/admin";

import { getIssues, updateIssues } from "./utils";

const TARGET = "admin.product-details.block.render";
export default reactExtension(TARGET, () => <App />);

const PAGE_SIZE = 2;

function App() {
  const { navigation, data, i18n } = useApi(TARGET);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState([]);
  const [issues, setIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const productId = data.selected[0].id;
  const issuesCount = issues.length;
  const totalPages = issuesCount / PAGE_SIZE;

  useEffect(() => {
    (async function getProductInfo() {
      const productData = await getIssues(productId);

      setLoading(false);
      if (productData?.data?.product?.metafield?.value) {
        const parsedIssues = JSON.parse(
          productData.data.product.metafield.value,
        );
        setInitialValues(
          parsedIssues.map(({ completed }) => Boolean(completed)),
        );
        setIssues(parsedIssues);
      }
    })();
  }, []);

  const paginatedIssues = useMemo(() => {
    if (issuesCount <= PAGE_SIZE) {
      return issues;
    }

    return [...issues].slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
  }, [issues, currentPage]);

  const handleChange = async (id, value) => {
    setIssues((currentIssues) => {
      const newIssues = [...currentIssues];
      const editingIssueIndex = newIssues.findIndex(
        (listIssue) => listIssue.id == id,
      );
      newIssues[editingIssueIndex] = {
        ...newIssues[editingIssueIndex],
        completed: value === "completed" ? true : false,
      };
      return newIssues;
    });
  };

  const handleDelete = async (id) => {
    const newIssues = issues.filter((issue) => issue.id !== id);
    setIssues(newIssues);
    await updateIssues(productId, newIssues);
  };

  const onSubmit = async () => {
    await updateIssues(productId, issues);
  };

  const onReset = () => {};

  return loading ? (
    <InlineStack blockAlignment="center" inlineAlignment="center">
      <ProgressIndicator size="large-100" />
    </InlineStack>
  ) : (
    <AdminBlock title={i18n.translate("name")}>
      <Form id={`issues-form`} onSubmit={onSubmit} onReset={onReset}>
        {issues.length ? (
          <>
            {paginatedIssues.map(
              ({ id, title, description, completed }, index) => {
                return (
                  <>
                    {index > 0 && <Divider />}
                    <Box key={id} padding="base small">
                      <InlineStack
                        blockAlignment="center"
                        inlineSize="100%"
                        gap="large"
                      >
                        <Box inlineSize="53%">
                          <Box inlineSize="100%">
                            <Text fontWeight="bold" textOverflow="ellipsis">
                              {title}
                            </Text>
                          </Box>

                          <Box inlineSize="100%">
                            <Text textOverflow="ellipsis">{description}</Text>
                          </Box>
                        </Box>
                        <Box inlineSize="22%">
                          <Select
                            label="Status"
                            name="status"
                            defaultValue={
                              initialValues[index] ? "completed" : "todo"
                            }
                            value={completed ? "completed" : "todo"}
                            onChange={(value) => handleChange(id, value)}
                            options={[
                              { label: "Todo", value: "todo" },
                              {
                                label: "Completed",
                                value: "completed",
                              },
                            ]}
                          />
                        </Box>
                        <Box inlineSize="25%">
                          <InlineStack
                            inlineSize="100%"
                            blockAlignment="center"
                            inlineAlignment="end"
                            gap="base"
                          >
                            <Button
                              variant="tertiary"
                              onPress={() =>
                                navigation?.navigate(
                                  `extension:issue-tracker-action?issueId=${id}`,
                                )
                              }
                            >
                              <Icon name="EditMinor" />
                            </Button>
                            <Button
                              onPress={() => handleDelete(id)}
                              variant="tertiary"
                            >
                              <Icon name="DeleteMinor" />
                            </Button>
                          </InlineStack>
                        </Box>
                      </InlineStack>
                    </Box>
                  </>
                );
              },
            )}
            <Divider />
            <Box paddingBlockStart="base">
              <Button
                onPress={() =>
                  navigation?.navigate(`extension:issue-tracker-action`)
                }
              >
                Add issue
              </Button>
            </Box>
            <InlineStack
              paddingBlockStart="large"
              blockAlignment="center"
              inlineAlignment="center"
            >
              <Button
                onPress={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                <Icon name="ChevronLeftMinor" />
              </Button>
              <InlineStack
                inlineSize={25}
                blockAlignment="center"
                inlineAlignment="center"
              >
                <Text>{currentPage}</Text>
              </InlineStack>
              <Button
                onPress={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages}
              >
                <Icon name="ChevronRightMinor" />
              </Button>
            </InlineStack>
          </>
        ) : (
          <>
            <Box paddingBlockEnd="large">
              <Text fontWeight="bold">No issues for this product</Text>
            </Box>
            <Button
              onPress={() =>
                navigation?.navigate(`extension:issue-tracker-action`)
              }
            >
              Add your first issue
            </Button>
          </>
        )}
      </Form>
    </AdminBlock>
  );
}
