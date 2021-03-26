import React from 'react';
import styled from '@emotion/styled';

import Tooltip from 'app/components/tooltip';
import {t} from 'app/locale';
import {BuiltinSymbolSource} from 'app/types/debugFiles';
import {
  CandidateDownloadStatus,
  ImageCandidate,
  ImageCandidateUnApplied,
} from 'app/types/debugImage';

import {INTERNAL_SOURCE} from '../utils';

import {getSourceTooltipDescription} from './utils';

type Props = {
  candidate: ImageCandidate;
  builtinSymbolSources: Array<BuiltinSymbolSource> | null;
};

function Information({candidate, builtinSymbolSources}: Props) {
  const {source_name, source, location} = candidate;
  const isInternalSource = source === INTERNAL_SOURCE;

  let filename: string | undefined = undefined;

  if (candidate.download.status === CandidateDownloadStatus.UNAPPLIED) {
    filename = (candidate as ImageCandidateUnApplied).filename;
  }

  return (
    <Wrapper>
      {filename}
      <Description>
        <DescriptionItem>
          {t('Source')}
          {': '}
          <Tooltip title={getSourceTooltipDescription(source, builtinSymbolSources)}>
            {source_name ?? t('Unknown')}
          </Tooltip>
        </DescriptionItem>
        {location && !isInternalSource && (
          <DescriptionItem>
            {t('Location')}: {isInternalSource ? t('Internal') : location}
          </DescriptionItem>
        )}
      </Description>
    </Wrapper>
  );
}

export default Information;

const Wrapper = styled('div')``;

const Description = styled('div')`
  font-size: ${p => p.theme.fontSizeSmall};
  color: ${p => p.theme.gray400};
`;

const DescriptionItem = styled('div')`
  width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
`;
