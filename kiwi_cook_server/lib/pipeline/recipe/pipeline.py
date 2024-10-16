import asyncio

import math


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

    async def feed(self, *data):
        if self.elements:
            self.elements[-1].output_queue = asyncio.Queue()
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
        self.max_retries = 2
        self.base_wait_time = 1  # Base waiting time in seconds

    async def process(self):
        retry_count = 0
        while True:
            try:
                task = await asyncio.wait_for(self.input_queue.get(), timeout=0.1)
                retry_count = 0  # Reset retry count when a task is received
            except asyncio.TimeoutError:
                if retry_count >= self.max_retries:
                    print(f"{self.name} exiting after {self.max_retries} retries")
                    break

                wait_time = self.base_wait_time * math.exp(retry_count)
                print(f"{self.name} waiting for {wait_time:.2f} seconds...")
                await asyncio.sleep(wait_time)
                retry_count += 1
                continue

            if task is None:
                if self.output_queue:
                    await self.output_queue.put(None)
                break

            # Check if the task is a tuple
            if isinstance(task, tuple):
                result = await self.process_task(*task)
            else:
                result = await self.process_task(task)
            if self.output_queue and result is not None:
                await self.output_queue.put(result)
            print(f"{self.name} processed task")
            self.input_queue.task_done()

    async def process_task(self, *args):
        raise NotImplementedError("Subclasses must implement process_task method")
