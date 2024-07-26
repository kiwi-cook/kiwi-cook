import asyncio


class Pipeline:
    def __init__(self):
        self.elements = []

    def add_element(self, element):
        if self.elements:
            self.elements[-1].output_queue = element.input_queue
        self.elements.append(element)

    async def run(self):
        tasks = [asyncio.create_task(element.process()) for element in self.elements]
        await asyncio.gather(*tasks)

    async def feed(self, data):
        await self.elements[0].input_queue.put(data)

    async def stop(self):
        for element in self.elements:
            await element.input_queue.put(None)
        await asyncio.gather(*[element.process() for element in self.elements])


class PipelineElement:
    def __init__(self, name):
        self.name = name
        self.input_queue = asyncio.Queue()
        self.output_queue = None

    async def process(self):
        while True:
            task = await self.input_queue.get()
            if task is None:
                if self.output_queue:
                    await self.output_queue.put(None)
                break
            print(f"{self.name} processing task")
            result = await self.process_task(task)
            if self.output_queue and result is not None:
                await self.output_queue.put(result)
            print(f"{self.name} processed task")
            self.input_queue.task_done()

    async def process_task(self, task):
        raise NotImplementedError("Subclasses must implement process_task method")
