import React from 'react';
import styled from '@emotion/styled';

import {Organization, Project} from 'app/types';
import {BuiltinSymbolSource} from 'app/types/debugFiles';
import {ImageCandidate} from 'app/types/debugImage';

import Actions from './actions';
import Features from './features';
import Information from './information';
import Processings from './processings';
import StatusTooltip from './statusTooltip';

type Props = {
  candidate: ImageCandidate;
  builtinSymbolSources: Array<BuiltinSymbolSource> | null;
  organization: Organization;
  projectId: Project['slug'];
  baseUrl: string;
  onDelete: (debugFileId: string) => void;
};

function Candidate({
  candidate,
  builtinSymbolSources,
  organization,
  projectId,
  baseUrl,
  onDelete,
}: Props) {
  const {download} = candidate;

  return (
    <React.Fragment>
      <Column>
        <StatusTooltip candidate={candidate} />
      </Column>

      <DebugFileColumn>
        <Information candidate={candidate} builtinSymbolSources={builtinSymbolSources} />
      </DebugFileColumn>

      <Column>
        <Processings candidate={candidate} />
      </Column>

      <Column>
        <Features download={download} />
      </Column>

      <Column>
        <Actions
          onDelete={onDelete}
          baseUrl={baseUrl}
          projectId={projectId}
          organization={organization}
          candidate={candidate}
        />
      </Column>
    </React.Fragment>
  );
}

export default Candidate;

const Column = styled('div')`
  display: flex;
  align-items: center;
`;

// Debug File Info Column
const DebugFileColumn = styled(Column)`
  flex-direction: column;
  align-items: flex-start;
`;
