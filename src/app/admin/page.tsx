"use client";

import {
  AppProvider,
  Badge,
  Card,
  DataTable,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

const orders = [
  [
    "RR-1084",
    "Santorini Lounge Chair",
    "?28,500",
    <Badge key="status-rr-1084" tone="success">
      Paid
    </Badge>,
  ],
  [
    "RR-1085",
    "Verve Dining Table",
    "?52,000",
    <Badge key="status-rr-1085" tone="attention">
      Pending
    </Badge>,
  ],
  [
    "RR-1086",
    "Halo Pendant Light",
    "?18,500",
    <Badge key="status-rr-1086" tone="success">
      Paid
    </Badge>,
  ],
];

export default function AdminPage() {
  return (
    <AppProvider i18n={{}}>
      <Page title="Raj & Raj Admin">
        <Layout>
          <Layout.Section>
            <Card padding="500">
              <Text as="h2" variant="headingMd">
                Store overview
              </Text>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Card padding="400">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Today’s sales
                  </Text>
                  <Text as="p" variant="headingLg">
                    ?1,02,500
                  </Text>
                </Card>
                <Card padding="400">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Orders in queue
                  </Text>
                  <Text as="p" variant="headingLg">
                    12
                  </Text>
                </Card>
                <Card padding="400">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Active categories
                  </Text>
                  <Text as="p" variant="headingLg">
                    8
                  </Text>
                </Card>
              </div>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card padding="500">
              <Text as="h2" variant="headingMd">
                Recent orders
              </Text>
              <div className="mt-4">
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text"]}
                  headings={["Order", "Item", "Total", "Status"]}
                  rows={orders}
                />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}
