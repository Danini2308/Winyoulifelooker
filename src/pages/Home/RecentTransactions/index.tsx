import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, List, Popover, Switch, Tag, Timeline, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  CloseCircleFilled,
  CloseCircleTwoTone,
  SyncOutlined,
} from "@ant-design/icons";
// import useMediaQuery from "@material-ui/core/useMediaQuery";
import TimeAgo from "timeago-react";
import BigNumber from "bignumber.js";
import { Colors, TwoToneColors } from "components/utils";
import ConfirmationsPerSecond from "components/ConfirmationsPerSecond";
import useSockets from "api/hooks/use-socket";
import { rawToRai } from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { Theme, PreferencesContext } from "api/contexts/Preferences";

const { Text } = Typography;

const RecentTransactions = () => {
  const { t } = useTranslation();
  const {
    theme,
    hideTransactionsUnderOneNano,
    disableLiveTransactions,
    setHideTransactionsUnderOneNano,
    setDisableLiveTransactions,
  } = React.useContext(PreferencesContext);
  const { recentTransactions, isConnected } = useSockets();
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isMediumAndLower = window.innerWidth <= 768;

  return (
    <Card
      size="small"
      title={t("pages.home.recentTransactions")}
      extra={
        <Popover
          placement="left"
          content={
            <List size="small">
              <List.Item>
                <Text style={{ marginRight: "16px" }}>
                  {t("pages.home.preferences.enableLiveUpdates")}
                </Text>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={(checked: boolean) => {
                    setDisableLiveTransactions(!checked);
                  }}
                  defaultChecked={!disableLiveTransactions}
                />
              </List.Item>
              <List.Item>
                <Text style={{ marginRight: "16px" }}>
                  {t("pages.home.preferences.includeAmountsUnder1")}
                </Text>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={(checked: boolean) => {
                    setHideTransactionsUnderOneNano(!checked);
                  }}
                  defaultChecked={!hideTransactionsUnderOneNano}
                />
              </List.Item>
            </List>
          }
          trigger="click"
        >
          <SettingOutlined />
        </Popover>
      }
    >
      <div
        className="sticky"
        style={{
          paddingBottom: "6px",
          zIndex: 1,
          background: theme === Theme.DARK ? "#1e1e1e" : "#fff",
        }}
      >
        <ConfirmationsPerSecond />
        {disableLiveTransactions ? (
          <div style={{ textAlign: "center" }}>
            {theme === Theme.DARK ? (
              <CloseCircleFilled style={{ color: TwoToneColors.SEND_DARK }} />
            ) : (
              <CloseCircleTwoTone twoToneColor={TwoToneColors.SEND} />
            )}
            <Text style={{ marginLeft: "8px" }}>
              {t("pages.home.liveUpdatesDisabled")}
            </Text>
          </div>
        ) : null}
        {isConnected &&
        !disableLiveTransactions &&
        !recentTransactions.length ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>
              {t("pages.home.waitingForTransactions")} ...
            </Text>
          </div>
        ) : null}
        {!isConnected && !disableLiveTransactions ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>
              {t("pages.home.connectingToBlockchain")} ...
            </Text>
          </div>
        ) : null}
      </div>
      {recentTransactions.length ? (
        <Timeline
          className="sticky"
          mode={isMediumAndLower ? "left" : "alternate"}
          // style={{ marginTop: disableLiveTransactions ? "24px" : 0 }}
        >
          {recentTransactions.map(
            ({ account, amount, hash, timestamp, block: { subtype } }) => {
              const color =
                // @ts-ignore
                Colors[
                  `${subtype.toUpperCase()}${
                    theme === Theme.DARK ? "_DARK" : ""
                  }`
                ];
              const alias = knownAccounts.find(
                ({ account: knownAccount }) => knownAccount === account,
              )?.alias;

              return (
                <Timeline.Item
                  color={color}
                  key={hash}
                  className={`fadein ${subtype === "send" ? "right" : "left"}`}
                >
                  <div className="first-row">
                    <Tag
                      color={
                        // @ts-ignore
                        TwoToneColors[
                          `${subtype.toUpperCase()}${
                            theme === Theme.DARK ? "_DARK" : ""
                          }`
                        ]
                      }
                      className={`tag-${subtype} timeline-tag`}
                    >
                      {subtype}
                    </Tag>
                    {subtype !== "change" ? (
                      <Text style={{ color }} className="timeline-amount">
                        {amount
                          ? `${new BigNumber(rawToRai(amount)).toFormat()} NANO`
                          : "N/A"}
                      </Text>
                    ) : null}
                    <TimeAgo
                      datetime={timestamp}
                      live={true}
                      className="timeline-timeago color-muted"
                      style={{
                        marginLeft: subtype === "change" ? "6px" : 0,
                      }}
                    />
                  </div>
                  {alias ? (
                    <div className="color-important">{alias}</div>
                  ) : null}
                  <Link to={`/account/${account}`} className="color-normal">
                    {account}
                  </Link>
                  <br />
                  <Link to={`/block/${hash}`} className="color-muted">
                    {hash}
                  </Link>
                </Timeline.Item>
              );
            },
          )}
        </Timeline>
      ) : null}
    </Card>
  );
};

export default RecentTransactions;
