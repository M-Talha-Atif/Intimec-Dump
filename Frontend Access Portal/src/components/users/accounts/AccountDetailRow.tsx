
import React from 'react';
import { AccountDetail } from '@/data/mock-account-details';
import AccountMetadataCard from './AccountMetadataCard';
import IdentityAttributesPanel from './IdentityAttributesPanel';
import AccountAccessBreakdown from './AccountAccessBreakdown';
import ShadowChangelogPanel from './ShadowChangelogPanel';

type AccountDetailRowProps = {
  accountDetail: AccountDetail;
};

const AccountDetailRow = ({ accountDetail }: AccountDetailRowProps) => {
  return (
    <div className="p-6 bg-slate-50/50 border-t">
      <div className="space-y-6">
        <AccountMetadataCard accountDetail={accountDetail} />
        <IdentityAttributesPanel accountDetail={accountDetail} />
        <AccountAccessBreakdown accountDetail={accountDetail} />
        {accountDetail.shadowId && (
          <ShadowChangelogPanel shadowId={accountDetail.shadowId} />
        )}
      </div>
    </div>
  );
};

export default AccountDetailRow;
