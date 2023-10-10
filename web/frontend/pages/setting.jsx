import React from 'react'
import {LegacyCard, Tabs} from '@shopify/polaris';
import {useState, useCallback} from 'react';
// import HomePage from './index';
// import NotFound from './NotFound'
import HidePrice from './HidePrice';
import CancelSubscription from './CancelSubscription';
import LabelSetting from './labelSetting';
// import GridSetting from './gridSetting';
import EmailSMT from './EmailSMT';

function setting() {
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: '1',
      content: 'Hide Price',
      panelID: 'marketing-content-1',
    },
    {
      id: '2',
      content: 'Cancel Subscription',
      panelID: 'customers-content-1',
    },
    {
      id: '3',
      content: 'Email SMTP',
      panelID: 'content-1',
    },
    {
      id: '4',
      content: 'Input Label Settings',
      panelID: 'Label',
    },
    // {
    //   id: '5',
    //   content: 'Grid Settings',
    //   panelID: 'Grid',
    // },
  ];

  return (
    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
      <LegacyCard.Section>
        {selected == 0 ? <HidePrice /> : ''}
        {selected == 1 ? <CancelSubscription /> : ''}
        {selected == 2 ? <EmailSMT /> : ''}
        {selected == 3 ? <LabelSetting /> : ''}
        {/* {selected == 4 ? <GridSetting /> : ''} */}
      </LegacyCard.Section>
    </Tabs>
  );
}
export default setting