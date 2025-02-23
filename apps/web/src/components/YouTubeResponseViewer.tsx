import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    width: '88vw',
    maxWidth: '1200px'
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  field: {
    marginBottom: '0.5rem'
  },
  label: {
    fontWeight: '500',
    color: '#0369a1'
  }
});

interface YouTubeData {
  title: string;
  publishedAt: string;
  channelTitle: string;
  description: string;
}

interface MappedCitation {
  title: string;
  publishedTime: Date;
  responseDescription: string;
  source: {
    referredToAs: string;
  };
}

export const YouTubeResponseViewer = ({ data }: { data: YouTubeData }) => {
  const mappedData: MappedCitation = {
    title: data.title,
    publishedTime: new Date(data.publishedAt),
    responseDescription: data.description,
    source: {
      referredToAs: data.channelTitle
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      <h3 {...stylex.props(styles.title)}>Mapped Citation Data:</h3>
      <div {...stylex.props(styles.field)}>
        <span {...stylex.props(styles.label)}>Citation.title: </span>
        {mappedData.title}
      </div>
      <div {...stylex.props(styles.field)}>
        <span {...stylex.props(styles.label)}>Citation.publishedTime: </span>
        {mappedData.publishedTime.toISOString()}
      </div>
      <div {...stylex.props(styles.field)}>
        <span {...stylex.props(styles.label)}>Citation.responseDescription: </span>
        {mappedData.responseDescription}
      </div>
      <div {...stylex.props(styles.field)}>
        <span {...stylex.props(styles.label)}>Source.referredToAs: </span>
        {mappedData.source.referredToAs}
      </div>
    </div>
  );
}; 