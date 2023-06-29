import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type Props = {
  open: boolean;
  prompt: any;
  updatePrompt: (promptId: string, newPrompt: any) => Promise<any>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function UpdatePromptModal({ open, setOpen, prompt, updatePrompt }: Props) {
  const [promptId, setPromptId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');

  useEffect(() => {
    if (!!prompt) {
      setName(prompt.name);
      setDescription(prompt.description);
      setPromptText(prompt.prompt);
      setPromptId(prompt._id);
    }
  }, [prompt]);

  const onUpdatePrompt = async () => {
    if (!!promptId && !!name) {
      const newPrompt: any = {};
      newPrompt.name = name;
      newPrompt.description = description;
      newPrompt.prompt = promptText;
      try {
        console.log('updatePrompt', promptId, newPrompt);
        await updatePrompt(promptId, newPrompt);
        setOpen(false);
      } catch (err) {
        console.log('error', err);
      }
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg border-white border rounded-md bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className=' text-white '>
                  <div className="mt-2 sm:mt-3">
                    <label htmlFor='name' className='text-lg font-semibold'>Name : </label>
                    <input type='text' name='name' id='name'
                      className='w-full rounded-lg    bg-gray-900/80'
                      value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <label htmlFor='description' className='text-lg font-semibold'>Description : </label>
                    <textarea name='description' id='description'
                      className='w-full rounded-lg    bg-gray-900/80'
                      placeholder='A description for your prompt'
                      value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <label htmlFor='prompt' className='text-lg font-semibold'>Prompt : </label>
                    <textarea name='prompt' id='prompt'
                      className='w-full rounded-lg  bg-gray-900/80'
                      placeholder='Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}'
                      value={promptText} onChange={(e) => setPromptText(e.target.value)} />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-green-600 px-3 py-2 mr-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    onClick={onUpdatePrompt}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default UpdatePromptModal;
