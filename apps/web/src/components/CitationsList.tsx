import CitationLine, { Citation } from './CitationLine';
import { create, props } from '@stylexjs/stylex';
import { useCitations } from '../contexts/CitationContext';

const styles = create({
  container: {
    padding: '1rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  loading: {
    color: '#6b7280',
    fontStyle: 'italic',
  }
});

interface CitationsListProps {
  citations?: Citation[];
  loading?: boolean;
  error?: string | null;
}

function CitationsList({ citations = [], loading = false, error = null }: CitationsListProps) {
  const { deleteCitation } = useCitations();
  
  if (loading) return <div {...props(styles.loading)}>Loading citations...</div>;
  
  if (error) return <div {...props(styles.message)}>Error: {error}</div>;
  
  const handleDelete = (id: number) => {
    deleteCitation(id);
  };
  
  return (
    <div {...props(styles.container)}>
      <h2 {...props(styles.heading)}>Saved Citations</h2>
      {citations.length === 0 ? (
        <p {...props(styles.message)}>No citations found</p>
      ) : (
        <ul {...props(styles.list)}>
          {citations.map((citation) => {
            console.log('Rendering citation:', citation);
            
            return (
              <li key={citation.id || Math.random()}>
                <CitationLine 
                  citation={citation} 
                  showReference={true}
                  useIdAsReference={true}
                  onDelete={handleDelete}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CitationsList;