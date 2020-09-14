import React, { useState } from 'react';
import { Modal, Accordion, Icon, AccordionTitleProps } from 'semantic-ui-react';
import { helpContent } from '../../entities/helpContent';
interface Props {
  open: boolean;
  dismiss: () => void;
}

export const HelpModal: React.FC<Props> = ({ open, dismiss }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement>,
    data: AccordionTitleProps
  ) => {
    const { index } = data;
    const newIndex = activeIndex === index ? -1 : (index as number);
    setActiveIndex(newIndex);
  };

  return (
    <>
      <Modal 
        open={open} 
        onClose={dismiss} 
        size="small" 
        dimmer="inverted"
        data-testid="help-modal"
      >
        <Modal.Header>
          <Icon name="question" />
          FAQ
        </Modal.Header>
        <Modal.Content scrolling>
          <Accordion fluid styled>
            {helpContent.map((content, index) => (
              <React.Fragment key={index}>
                <Accordion.Title
                  active={activeIndex === index}
                  index={index}
                  onClick={handleClick}
                >
                  <Icon name="dropdown" />
                  {content.title}
                </Accordion.Title>
                <Accordion.Content active={activeIndex === index}>
                  {content.content.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </Accordion.Content>
              </React.Fragment>
            ))}
          </Accordion>
        </Modal.Content>
      </Modal>
    </>
  );
};
