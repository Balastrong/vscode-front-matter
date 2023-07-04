import * as React from 'react';
import { CustomScript, FolderInfo, Mode, PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { Collapsible } from './Collapsible';
import { GlobalSettings } from './GlobalSettings';
import { OtherActions } from './OtherActions';
import { FolderAndFiles } from './FolderAndFiles';
import { SponsorMsg } from './SponsorMsg';
import { StartServerButton } from './StartServerButton';
import { FeatureFlag } from '../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../constants/Features';
import { Messenger } from '@estruyf/vscode/dist/client';
import { GitAction } from './Git/GitAction';
import { useMemo } from 'react';
import * as l10n from "@vscode/l10n"
import { LocalizationKey } from '../../localization';

export interface IBaseViewProps {
  settings: PanelSettings | undefined;
  folderAndFiles: FolderInfo[] | undefined;
  mode: Mode | undefined;
}

const BaseView: React.FunctionComponent<IBaseViewProps> = ({
  settings,
  folderAndFiles,
  mode
}: React.PropsWithChildren<IBaseViewProps>) => {
  const openDashboard = () => {
    Messenger.send(CommandToCode.openDashboard);
  };

  const initProject = () => {
    Messenger.send(CommandToCode.initProject);
  };

  const createContent = () => {
    Messenger.send(CommandToCode.createContent);
  };

  const openPreview = () => {
    Messenger.send(CommandToCode.openPreview);
  };

  const runBulkScript = (script: CustomScript) => {
    Messenger.send(CommandToCode.runCustomScript, {
      title: script.title,
      script
    });
  };

  const customActions: any[] = (settings?.scripts || []).filter(
    (s) => s.bulk && (s.type === 'content' || !s.type)
  );

  const allPanelValues = useMemo(() => {
    return Object.values(FEATURE_FLAG.panel).filter(v => v !== FEATURE_FLAG.panel.globalSettings)
  }, [FEATURE_FLAG.panel]);

  const isSomethingShown = useMemo(() => {
    const panelModeValues = (mode?.features || []).filter(v => v.startsWith('panel.'));

    if (panelModeValues.length === 0) {
      return true;
    }

    if (panelModeValues.includes(FEATURE_FLAG.panel.globalSettings) ||
      panelModeValues.includes(FEATURE_FLAG.panel.actions) ||
      panelModeValues.includes(FEATURE_FLAG.panel.recentlyModified) ||
      panelModeValues.includes(FEATURE_FLAG.panel.otherActions)) {
      return true;
    }
  }, [mode?.features]);

  return (
    <div className="frontmatter">
      <div className={`ext_actions`}>
        {!settings?.isInitialized && (
          <div className={`initialize_actions`}>
            <button onClick={initProject}>Initialize project</button>
          </div>
        )}

        {settings?.isInitialized && (
          <>
            <GitAction settings={settings} />

            <FeatureFlag features={mode?.features || [...allPanelValues]} flag={FEATURE_FLAG.panel.globalSettings}>
              <GlobalSettings settings={settings} isBase />
            </FeatureFlag>

            <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.actions}>
              <Collapsible id={`base_actions`} title={l10n.t(LocalizationKey.panelActionsTitle)}>
                <div className={`base__actions`}>
                  <button onClick={openDashboard}>{l10n.t(LocalizationKey.panelActionsOpenDashboard)}</button>
                  <button onClick={openPreview} disabled={!settings?.preview?.host}>
                    {l10n.t(LocalizationKey.panelActionsOpenPreview)}
                  </button>
                  <StartServerButton settings={settings} />

                  <button onClick={createContent}>{l10n.t(LocalizationKey.panelActionsCreateContent)}</button>

                  {customActions.map((script) => (
                    <button key={script.title} onClick={() => runBulkScript(script)}>
                      {script.title}
                    </button>
                  ))}
                </div>
              </Collapsible>
            </FeatureFlag>
          </>
        )}

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.recentlyModified}>
          <FolderAndFiles data={folderAndFiles} isBase />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.otherActions}>
          <OtherActions settings={settings} isFile={false} isBase />
        </FeatureFlag>
      </div>

      {
        !isSomethingShown && (
          <div className={`base__empty`}>
            Open a file to see more actions
          </div>
        )
      }

      <SponsorMsg isBacker={settings?.isBacker} />
    </div>
  );
};

BaseView.displayName = 'BaseView';
export { BaseView };
