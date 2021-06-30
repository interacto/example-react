import {Component} from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";
import styles from "./Tabs.module.css"

type MyState= {
    currentTab: string
};

class Tabs extends Component<any, MyState>
{
    static propTypes = {
        children: PropTypes.instanceOf(Array).isRequired,
    }

    constructor(props: {} | Readonly<{}>)
    {
        super(props);

        const tab = (this.props.children as React.ReactElement[])[0];
        if(tab!) {
            this.state = {
                currentTab: tab.props.title,
            };
        }
    }

    onClickTabItem = (tab: string) => {
        this.setState({currentTab: tab});
    }

    render() {
        const {
            onClickTabItem,
            props: {
                children,
            },
            state: {
                currentTab,
            }
        } = this;

        return (
            <div className="tabs">
                <ol className={styles.tabBar}>
                    {
                        (children as React.ReactElement[]).map((child) => {
                        const { title } = child.props;

                        return (
                            <Tab
                                currentTab={currentTab}
                                key={title}
                                label={title}
                                onClick={onClickTabItem}
                            />
                        );
                    })}
                </ol>
                <div className="tab-content">
                    {(children as React.ReactElement[]).map((child) => {
                        if (child.props.title !== currentTab) {
                            return (
                                <div className={styles.inactiveTabContent} key={child.props.title}>{child.props.children}</div>
                            );
                        }
                        return <div className={styles.activeTabContent} key={child.props.title}>{child.props.children}</div>;
                    })}
                </div>
            </div>
        );
    }
}

export default Tabs;
