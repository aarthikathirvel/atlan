import { queryTemplates } from '../data/mockData';

const QueryTemplates = ({ onSelectTemplate }) => {
  return (
    <div className="query-templates">
      <div className="query-templates-header">
        <h3>Query Templates</h3>
        <p className="query-templates-subtitle">Click a template to load it into the editor</p>
      </div>
      <div className="query-templates-list">
        {queryTemplates.map((template, index) => (
          <div
            key={index}
            className="query-template-item"
            onClick={() => onSelectTemplate(template.query)}
          >
            <div className="query-template-name">{template.name}</div>
            <div className="query-template-query">
              <code>{template.query}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryTemplates;

