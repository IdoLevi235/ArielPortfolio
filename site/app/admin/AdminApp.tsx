'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import type { Content } from '@/types';
import HomeEditor from './editors/HomeEditor';
import AdsEditor from './editors/AdsEditor';
import ProjectsEditor from './editors/ProjectsEditor';
import SiteEditor from './editors/SiteEditor';
import PreviewPane from './PreviewPane';
import styles from './admin.module.css';

type Tab = 'home' | 'ads' | 'bezalel' | 'personal' | 'photography' | 'site';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'ads', label: 'Ads' },
  { id: 'bezalel', label: 'Bezalel' },
  { id: 'personal', label: 'Personal' },
  { id: 'photography', label: 'Photography' },
  { id: 'site', label: 'Site' },
];

export default function AdminApp() {
  const [content, setContent] = useState<Content | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadInFlight, setUploadInFlight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [preview, setPreview] = useState(false);

  // Load content on mount
  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data: Content) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load content. Please refresh the page.');
        setLoading(false);
        console.error(err);
      });
  }, []);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const updateContent = useCallback((updater: (prev: Content) => Content) => {
    setContent((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
    setDirty(true);
    setSaveSuccess(false);
  }, []);

  async function handlePublish() {
    if (!content || saving || !dirty || uploadInFlight) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Save failed. Please try again.');
      } else {
        setDirty(false);
        setSaveSuccess(true);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    signOut({ redirectTo: '/signin' });
  }

  const canPublish = dirty && !saving && !uploadInFlight && !loading;

  return (
    <div className={styles.shell}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.logo}>Content Manager</span>
        </div>

        <nav className={styles.tabs} aria-label="Editor sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.topbarRight}>
          <label className={styles.previewToggle}>
            <input
              type="checkbox"
              checked={preview}
              onChange={(e) => setPreview(e.target.checked)}
              className={styles.previewCheckbox}
            />
            <span className={styles.previewLabel}>Preview</span>
          </label>

          <button
            className={`${styles.publishBtn} ${canPublish ? styles.publishBtnActive : ''}`}
            onClick={handlePublish}
            disabled={!canPublish}
            aria-busy={saving}
          >
            {saving ? 'Saving…' : 'Publish changes'}
          </button>

          <button
            className={styles.signOutBtn}
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Status bar */}
      {(error || saveSuccess || dirty || uploadInFlight) && (
        <div className={`${styles.statusBar} ${error ? styles.statusError : saveSuccess ? styles.statusSuccess : styles.statusDirty}`}>
          {error && (
            <>
              <span className={styles.statusIcon}>!</span>
              {error}
              <button className={styles.statusDismiss} onClick={() => setError(null)} aria-label="Dismiss error">
                ×
              </button>
            </>
          )}
          {!error && saveSuccess && (
            <>
              <span className={styles.statusIcon}>✓</span>
              Saved — your site will update in about a minute.
            </>
          )}
          {!error && !saveSuccess && uploadInFlight && (
            <>
              <span className={styles.statusIcon}>↑</span>
              Uploading media…
            </>
          )}
          {!error && !saveSuccess && !uploadInFlight && dirty && (
            <>
              <span className={styles.statusIcon}>·</span>
              Unsaved changes
            </>
          )}
        </div>
      )}

      {/* Main content */}
      <div className={styles.main}>
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-label="Loading content" />
            <p>Loading content…</p>
          </div>
        )}

        {!loading && !content && !error && (
          <div className={styles.emptyState}>
            <p>No content found.</p>
          </div>
        )}

        {!loading && content && (
          <>
            {preview ? (
              <PreviewPane content={content} tab={activeTab} />
            ) : (
              <div className={styles.editorArea}>
                {activeTab === 'home' && (
                  <HomeEditor
                    home={content.home}
                    onChange={(home) => updateContent((c) => ({ ...c, home }))}
                  />
                )}
                {activeTab === 'ads' && (
                  <AdsEditor
                    ads={content.ads}
                    onChange={(ads) => updateContent((c) => ({ ...c, ads }))}
                    onUploadStart={() => setUploadInFlight(true)}
                    onUploadEnd={() => setUploadInFlight(false)}
                  />
                )}
                {activeTab === 'bezalel' && (
                  <ProjectsEditor
                    page="bezalel"
                    data={content.bezalel}
                    allContent={content}
                    onChange={(bezalel) => updateContent((c) => ({ ...c, bezalel }))}
                    onMoveProject={(project, targetPage) => {
                      updateContent((c) => {
                        const from = { ...c.bezalel };
                        from.projects = from.projects.filter((p) => p.id !== project.id);
                        const to = { ...c[targetPage as 'personal' | 'photography'] };
                        to.projects = [...to.projects, { ...project, isLast: true }];
                        // Fix isLast flags
                        from.projects = from.projects.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
                        to.projects = to.projects.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
                        return { ...c, bezalel: from, [targetPage]: to };
                      });
                    }}
                    onUploadStart={() => setUploadInFlight(true)}
                    onUploadEnd={() => setUploadInFlight(false)}
                  />
                )}
                {activeTab === 'personal' && (
                  <ProjectsEditor
                    page="personal"
                    data={content.personal}
                    allContent={content}
                    onChange={(personal) => updateContent((c) => ({ ...c, personal }))}
                    onMoveProject={(project, targetPage) => {
                      updateContent((c) => {
                        const from = { ...c.personal };
                        from.projects = from.projects.filter((p) => p.id !== project.id);
                        const to = { ...c[targetPage as 'bezalel' | 'photography'] };
                        to.projects = [...to.projects, { ...project, isLast: true }];
                        from.projects = from.projects.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
                        to.projects = to.projects.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
                        return { ...c, personal: from, [targetPage]: to };
                      });
                    }}
                    onUploadStart={() => setUploadInFlight(true)}
                    onUploadEnd={() => setUploadInFlight(false)}
                  />
                )}
                {activeTab === 'photography' && (
                  <ProjectsEditor
                    page="photography"
                    data={content.photography}
                    allContent={content}
                    onChange={(photography) => updateContent((c) => ({ ...c, photography }))}
                    onMoveProject={(project, targetPage) => {
                      updateContent((c) => {
                        const from = { ...c.photography };
                        from.projects = from.projects.filter((p) => p.id !== project.id);
                        const to = { ...c[targetPage as 'bezalel' | 'personal'] };
                        to.projects = [...to.projects, { ...project, isLast: true }];
                        from.projects = from.projects.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
                        to.projects = to.projects.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
                        return { ...c, photography: from, [targetPage]: to };
                      });
                    }}
                    onUploadStart={() => setUploadInFlight(true)}
                    onUploadEnd={() => setUploadInFlight(false)}
                  />
                )}
                {activeTab === 'site' && (
                  <SiteEditor
                    site={content.site}
                    onChange={(site) => updateContent((c) => ({ ...c, site }))}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
